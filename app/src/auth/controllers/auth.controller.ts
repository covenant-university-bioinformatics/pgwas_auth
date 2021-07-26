import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthRegisterDto } from '../dto/auth-register.dto';
import { AuthService } from '../services/auth.service';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { GetUser } from '../decorators/get-user.decorator';
import { EmailConfirmDto } from '../dto/emailconfirm.dto';
import { generalTemplate } from '../utilities/emailtemplates/general.template';
import { AuthResetPasswordDto } from '../dto/auth-reset-password.dto';
import { ResetPasswordParamDto } from '../dto/reset-password-param.dto';
import { AuthResetPasswordEmailDto } from '../dto/auth-reset-password-email.dto';
import { AuthChangePasswordDto } from '../dto/auth-change-password.dto';

@Controller('api/auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Post('/register')
  signUp(
    @Body(ValidationPipe)
    authRegisterDto: AuthRegisterDto,
  ) {
    this.logger.verbose(
      `A new signup request, user details: ${JSON.stringify(authRegisterDto)}`,
    );
    return this.authService.signUp(authRegisterDto);
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Res() res: Response,
  ) {
    this.logger.verbose(
      `A new sign in request, user details: ${JSON.stringify(
        authCredentialsDto,
      )}`,
    );

    const token = await this.authService.signIn(authCredentialsDto);

    //cookie options
    const options: { expires: Date; httpOnly: boolean; secure?: boolean } = {
      expires: new Date(Date.now() + 3600000), //1hr
      httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    res
      .status(200)
      .cookie('accessToken', token.accessToken, options)
      .json(token);
  }

  @Get('/emailconfirm/:email/:token')
  async emailConfirm(@Param() emailConfirmDto: EmailConfirmDto, @Res() res) {
    const value = await this.authService.confirmEmail(emailConfirmDto);
    if (value) {
      res
        .status(200)
        .send(
          generalTemplate('<strong>Email confirmation successful</strong>'),
        );
    } else {
      res.status(400).send(
        generalTemplate(`<strong>Email confirmation not successful!<br> User with email: ${emailConfirmDto.email} has been deleted<br>
      If this is truly your email, please re-register and confirm the email as soon as possible.<br>
      Thank you for your patience!</strong>
  `),
      );
    }
  }

  @Post('/forgotpassword')
  async forgotPassword(
    @Body(ValidationPipe) authResetPasswordEmailDto: AuthResetPasswordEmailDto,
  ) {
    this.logger.verbose(
      `A request password reset, user details: ${JSON.stringify(
        authResetPasswordEmailDto,
      )}`,
    );

    return await this.authService.forgotPassword(authResetPasswordEmailDto);
  }

  @Post('/resetpassword/:token')
  async resetPassword(
    @Param() resetPasswordParamDto: ResetPasswordParamDto,
    @Body(ValidationPipe) authResetPasswordDto: AuthResetPasswordDto,
  ) {
    return await this.authService.resetPassword(
      resetPasswordParamDto.token,
      authResetPasswordDto,
    );
  }

  @Put('/updatepassword')
  async updatePassword(
    @Body(ValidationPipe) authChangePasswordDto: AuthChangePasswordDto,
    @GetUser() user,
  ) {
    this.logger.verbose(
      `A request password change, user details: ${JSON.stringify(
        authChangePasswordDto,
      )}`,
    );

    return await this.authService.updatePassword(authChangePasswordDto, user);
  }

  @Post('/test')
  test(@GetUser() user) {
    console.log(user);
  }
}
