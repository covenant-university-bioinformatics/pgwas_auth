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
import {CookieOptions, Response} from 'express';
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
    return this.authService.signUp(authRegisterDto);
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Res() res: Response,
  ) {

    const { user, accessToken: token } = await this.authService.signIn(
      authCredentialsDto,
    );

    const expiresIn = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000); //7 days

    //cookie options
    const options: CookieOptions = {
      expires: expiresIn,
      httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
      options.sameSite = "none";
      options.domain = "spgwas.waslitbre.org"
    }

    res
      .status(200)
      .cookie('accessToken', token, options)
      .json({ user, expiresIn, accessToken: token });
  }

  @Get('/emailconfirm/:email/:token')
  async emailConfirm(@Param() emailConfirmDto: EmailConfirmDto, @Res() res) {
    const value = await this.authService.confirmEmail(emailConfirmDto);
    if(typeof value === "string"){
      res
          .status(200)
          .send(
              generalTemplate(
                  `<strong>${value}</strong><br/><strong>Please kindly sign in <a href="https://www.spgwas.waslitbre.org/sign_in">here</a></strong>`,
              ),
          );
    }
    else{
      if (value) {
        res
            .status(200)
            .send(
                generalTemplate(
                    '<strong>Email confirmation successful</strong><br/><strong>Please kindly sign in <a href="https://www.spgwas.waslitbre.org/sign_in">here</a></strong>',
                ),
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
  }

  @Post('/forgotpassword')
  async forgotPassword(
    @Body(ValidationPipe) authResetPasswordEmailDto: AuthResetPasswordEmailDto,
  ) {

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

    return await this.authService.updatePassword(authChangePasswordDto, user);
  }

  @Post('/test')
  test(@GetUser() user) {
    console.log(user);
  }

  @Get('/logout')
  logout(@Res() res: Response) {
    console.log('sign out');
    res
      .status(200)
      .cookie('accessToken', 'none', {
        expires: new Date(Date.now() + 1000),
        httpOnly: true,
      })
      .json({ success: true });
  }
}
