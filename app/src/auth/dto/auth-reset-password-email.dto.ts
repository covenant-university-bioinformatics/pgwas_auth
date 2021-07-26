import { Matches, IsEmail } from 'class-validator';

export class AuthResetPasswordEmailDto {
  @IsEmail()
  @Matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, {
    message: 'Please add valid email',
  })
  email: string;
}
