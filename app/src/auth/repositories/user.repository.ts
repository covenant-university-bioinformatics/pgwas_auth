// import { EntityRepository, QueryRunner, Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import * as crypto from 'crypto';
// import { User } from '../models/user.entity';
// import { AuthRegisterDto } from '../dto/auth-signup.dto';
// import {
//   BadRequestException,
//   InternalServerErrorException,
//   Logger,
//   NotFoundException,
// } from '@nestjs/common';
// import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
// import { EmailConfirmDto } from '../dto/emailconfirm.dto';
// import { ApproveUserDto } from '../dto/approveuser.dto';
// import { PersonnelUpdatedDto } from '../../events/dto/personnelUpdated.dto';
// import { AuthSignupAdminDto } from '../dto/auth-signup-admin.dto';
//
// @EntityRepository(User)
// export class UserRepository extends Repository<User> {
//   private logger = new Logger();
//
//   async signUp(
//     authSignUpDto: AuthRegisterDto,
//     queryRunner: QueryRunner,
//   ): Promise<string> {
//     const {
//       username,
//       initials,
//       email,
//       password,
//       firstname,
//       lastname,
//       researchGroup,
//       sex,
//     } = authSignUpDto;
//
//     const user = this.create();
//     user.username = username;
//     user.initials = initials;
//     user.firstname = firstname;
//     user.lastname = lastname;
//     user.salt = await bcrypt.genSalt();
//     user.password = await this.hashPassword(password, user.salt);
//     user.researchGroup = researchGroup;
//     user.email = email;
//     user.sex = sex;
//     user.emailConfirmed = false;
//     user.approved = false;
//     const token = user.getEmailConfirmToken();
//     await queryRunner.manager.save(user);
//     return token;
//   }
//
//   async signUpAdmin(
//     authSignUpDto: AuthSignupAdminDto,
//     queryRunner: QueryRunner,
//   ) {
//     const {
//       username,
//       initials,
//       email,
//       password,
//       firstname,
//       lastname,
//       role,
//       sex,
//     } = authSignUpDto;
//
//     const user = this.create();
//     user.username = username;
//     user.initials = initials;
//     user.firstname = firstname;
//     user.lastname = lastname;
//     user.salt = await bcrypt.genSalt();
//     user.password = await this.hashPassword(password, user.salt);
//     // @ts-ignore
//     user.role = role;
//     user.email = email;
//     user.sex = sex;
//     user.emailConfirmed = true;
//     user.approved = true;
//
//     return await queryRunner.manager.save(user);
//   }
//
//   async updateUser(data: PersonnelUpdatedDto) {
//     const user = await this.findOne({ username: data.oldUsername });
//
//     if (!user) {
//       throw new NotFoundException();
//     }
//
//     Object.defineProperty(data, 'oldUsername', {
//       enumerable: false,
//     });
//
//     for (const key in data) {
//       if (data.hasOwnProperty(key)) {
//         if (data[key]) {
//           user[key] = data[key];
//         }
//       }
//     }
//
//     return await user.save();
//   }
//
//   private async hashPassword(password: string, salt: string): Promise<string> {
//     return bcrypt.hash(password, salt);
//   }
//
//   async validateUserPassword(
//     authCredentialsDto: AuthCredentialsDto,
//   ): Promise<string> {
//     const { username, password } = authCredentialsDto;
//
//     const user = await this.findOne({ username });
//
//     if (user && (await user.validatePassword(password))) {
//       return user.username;
//     } else {
//       return null;
//     }
//   }
//
//   async confirmEmail(
//     emailConfirmDto: EmailConfirmDto,
//   ): Promise<User | boolean> {
//     const { email, token } = emailConfirmDto;
//
//     if (!email || !token) return false;
//
//     const notVerifiedUser = await this.findOne({ email });
//
//     if (notVerifiedUser?.emailConfirmed) return true;
//
//     const hash = crypto.createHash('sha256').update(token).digest('hex');
//
//     const user = await this.createQueryBuilder('user')
//       .where(
//         'user.emailConfirmedToken = :hash AND user.emailConfirmedTokenExpire > :currentTime',
//         { hash, currentTime: new Date(Date.now()) },
//       )
//       .getOne();
//
//     if (user?.email.toLowerCase() === email.toLowerCase()) {
//       user.emailConfirmedTokenExpire = null;
//       user.emailConfirmedToken = null;
//       user.emailConfirmed = true;
//
//       return await user.save();
//     } else {
//       await this.delete({
//         email,
//       });
//       return false;
//     }
//   }
//
//   async approveUser(approveUser: ApproveUserDto): Promise<User> {
//     const user = await this.findOne(approveUser.email);
//
//     if (!user) {
//       throw new BadRequestException(
//         'Approval failed (User not found or deleted)',
//       );
//     }
//
//     user.approved = true;
//
//     try {
//       return await user.save();
//     } catch (e) {
//       throw new InternalServerErrorException();
//     }
//   }
//
//   async updateApproval(username: string, email: string, approval: boolean) {
//     const user = await this.findOne({ username, email });
//
//     if (!user) {
//       throw new NotFoundException();
//     }
//
//     user.approved = approval;
//
//     try {
//       await user.save();
//     } catch (e) {
//       console.log(e);
//     }
//   }
// }
