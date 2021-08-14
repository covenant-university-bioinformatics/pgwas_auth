import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRegisterDto } from '../dto/auth-register.dto';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { JwtPayload } from '../jwt-payload.interface';
import { EmailConfirmDto } from '../dto/emailconfirm.dto';
import { EmailNotifyPublisher } from '../../nats/publishers/emialnotify.publisher';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../models/user.model';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthResetPasswordDto } from '../dto/auth-reset-password.dto';
import { AuthResetPasswordEmailDto } from '../dto/auth-reset-password-email.dto';
import { AuthChangePasswordDto } from '../dto/auth-change-password.dto';
import { UserApprovedPublisher } from '../../nats/publishers/user-approved-publisher';
import { UserUpdatedPublisher } from '../../nats/publishers/user-updated.publisher';
import { UserDeletedPublisher } from '../../nats/publishers/user-deleted.publisher';
import { EmailConfirmPublisher } from '../../nats/publishers/user-emailconfirm-publisher';

@Injectable()
export class AuthService {
  private logger = new Logger();

  @Inject(EmailNotifyPublisher)
  private emailNotifyPublisher: EmailNotifyPublisher;
  @Inject(EmailConfirmPublisher)
  private emailConfirmPublisher: EmailConfirmPublisher;
  @Inject(UserApprovedPublisher)
  private userApprovedPublisher: UserApprovedPublisher;
  @Inject(UserUpdatedPublisher)
  private userUpdatedPublisher: UserUpdatedPublisher;
  @Inject(UserDeletedPublisher)
  private userDeletedPublisher: UserDeletedPublisher;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    //from nestjs jwt, service imported in auth module
    private jwtService: JwtService,
  ) {}

  async signUp(
    authRegisterDto: AuthRegisterDto,
  ): Promise<{ success: boolean }> {
    const session = await this.userModel.startSession();
    session.startTransaction();
    try {
      const opts = { session };

      // const user = await this.userModel.create(authRegisterDto);
      const user = new this.userModel(authRegisterDto);
      const token = user.generateEmailToken();

      await user.save(opts);

      await this.emailNotifyPublisher.publish({
        type: 'userRegistration',
        recipient: {
          email: authRegisterDto.email,
        },
        payload: {
          token,
          username: authRegisterDto.username,
        },
      });
      await session.commitTransaction();
      return {
        success: true,
      };
    } catch (e) {
      console.log(e);
      if (e.code === 11000) {
        throw new ConflictException('Username/Email already exists: ');
      }
      await session.abortTransaction();
      throw new HttpException(e.message, 400);
    } finally {
      session.endSession();
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ) {
    let user;

    if (authCredentialsDto.username) {
      user = await this.userModel
        .findOne({
          username: authCredentialsDto.username,
        })
        .select('+password')
        .select('+salt');
    }

    if (authCredentialsDto.email) {
      user = await this.userModel
        .findOne({
          email: authCredentialsDto.email,
        })
        .select('+password');
    }

    if (!user) {
      this.logger.log(
        `Authentication failed ${JSON.stringify(authCredentialsDto)}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const validate = await user.validatePassword(authCredentialsDto.password);

    if (!validate) {
      this.logger.log(
        `Authentication failed ${JSON.stringify(authCredentialsDto)}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { username: user.username }; //can add other information like roles, emails, but no sensitive info
    //constructs jwt with header,payload and signature
    const accessToken = this.jwtService.sign(payload);

    user.password = null;
    user.salt = null;
    //send to client
    return { user, accessToken };
  }

  async confirmEmail(emailConfirmDto: EmailConfirmDto): Promise<boolean | string> {
    const session = await this.userModel.startSession();
    session.startTransaction();
    try {
      const opts = { session };
      const { email, token } = emailConfirmDto;

      if (!email || !token) return false;

      const notVerifiedUser = await this.userModel.findOne({ email });

      if (!notVerifiedUser) {
        throw new BadRequestException('User not found');
      }

      if (notVerifiedUser.emailConfirmed) {
        return 'Email already confirmed';
      }

      const hash = crypto.createHash('sha256').update(token).digest('hex');

      const verifiedUser = await this.userModel.findOne({
        emailConfirmedToken: hash,
        emailConfirmedTokenExpire: {
          $gt: new Date(Date.now()),
        },
      });

      if (verifiedUser?.email.toLowerCase() === email.toLowerCase()) {
        verifiedUser.emailConfirmedTokenExpire = null;
        verifiedUser.emailConfirmedToken = null;
        verifiedUser.emailConfirmed = true;
        await verifiedUser.save(opts);

        // send verified user to jobs microservice
        await this.userApprovedPublisher.publish({
          username: verifiedUser.username,
          email: verifiedUser.email,
          emailConfirmed: verifiedUser.emailConfirmed,
          role: verifiedUser.role,
          // updatedAt: verifiedUser.updateAt
        });

        await session.commitTransaction();
        return true;
      } else {
        await this.userModel.deleteOne(
          {
            email,
          },
          opts,
        );
        await session.commitTransaction();
        return false;
      }
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      throw new HttpException(e.message, 400);
    } finally {
      session.endSession();
    }
  }

  async findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    const user = await this.userModel.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const oldUser = await this.findOne(id);
    const oldUsername = oldUser.username;
    if (updateUserDto.email && updateUserDto.email === oldUser.email) {
      throw new BadRequestException('Please submit a new email');
    }

    if (updateUserDto.username && updateUserDto.username === oldUser.username) {
      throw new BadRequestException('Please submit a new username');
    }

    const updateProperties = ['username', 'email'];

    for (const updateElement in updateUserDto) {
      if (updateUserDto.hasOwnProperty(updateElement)) {
        if (updateProperties.indexOf(updateElement) === -1) {
          throw new ForbiddenException(
            `Illegal parameter: ${updateElement} found`,
          );
        }
      }
    }

    let accessToken;
    if (updateUserDto.username) {
      oldUser.username = updateUserDto.username;
      const payload: JwtPayload = { username: updateUserDto.username };
      accessToken = this.jwtService.sign(payload);
    }

    let token;
    if (updateUserDto.email) {
      token = oldUser.generateEmailToken();
      oldUser.email = updateUserDto.email;
    }

    //save user and ensure no duplicate records
    try {
      await oldUser.save();
      if (updateUserDto.email) {
        await this.emailConfirmPublisher.publish({
          username: oldUser.username,
          email: oldUser.email,
          emailConfirmed: oldUser.emailConfirmed,
        });
      }
      if (updateUserDto.username) {
        await this.userUpdatedPublisher.publish({
          username: oldUser.username,
          oldUsername,
        });
      }
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException(
          'Username/Email already exists: ' + e.message,
        );
      }
      throw new InternalServerErrorException(e.message);
    }

    //send email to user after record is saved
    if (updateUserDto.email) {
      await this.emailNotifyPublisher.publish({
        type: 'emailUpdated',
        recipient: {
          email: updateUserDto.email,
        },
        payload: {
          token,
          username: oldUser.username,
        },
      });
    }

    return { success: true, accessToken };
  }

  async updatePassword(
    authChangePasswordDto: AuthChangePasswordDto,
    user: User,
  ) {
    const updateUser = await this.userModel.findOne({
      username: user.username,
    });

    const validate = await updateUser.validatePassword(
      authChangePasswordDto.currentPassword,
    );

    if (!validate) {
      throw new ForbiddenException('Password is incorrect');
    }

    updateUser.password = authChangePasswordDto.newPassword;

    await updateUser.save();

    return { success: true };
  }

  async forgotPassword(authResetPasswordEmailDto: AuthResetPasswordEmailDto) {
    const user = await this.userModel.findOne({
      email: authResetPasswordEmailDto.email,
    });

    if (!user) {
      throw new NotFoundException(
        `User with email ${authResetPasswordEmailDto.email} not found`,
      );
    }

    //  Get reset token
    const token = await user.generateResetPasswordToken();
    //send event to email service to send token email to client
    await this.emailNotifyPublisher.publish({
      type: 'forgotPassword',
      recipient: {
        email: user.email,
      },
      payload: {
        token, //has to be a link on the front
        username: user.username,
      },
    });

    await user.save();
    return user;
  }

  async resetPassword(
    token: string,
    authResetPasswordDto: AuthResetPasswordDto,
  ) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel
      .findOne({
        resetPasswordToken: hash,
        resetPasswordTokenExpire: { $gt: new Date(Date.now()) },
      })
      .select('+password');

    if (!user) {
      throw new BadRequestException('Invalid token');
    }
    user.password = authResetPasswordDto.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    await user.save();
    return { success: true };
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    this.userModel.deleteOne({ username: user.username });

    await this.userDeletedPublisher.publish({
      username: user.username,
      email: user.email,
    });
  }
}
