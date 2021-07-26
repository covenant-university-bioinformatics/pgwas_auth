import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class AuthCredentialsDto {
  @IsOptional()
  @IsString({ message: 'Authentication failed' })
  @MinLength(4, { message: 'Authentication failed' })
  @MaxLength(20, { message: 'Authentication failed' })
  username: string;

  @IsOptional()
  @Matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, {
    message: 'Authentication failed',
  })
  email: string;

  @IsString()
  @MinLength(4, { message: 'Authentication failed' })
  @MaxLength(20, { message: 'Authentication failed' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Authentication failed',
  })
  password: string;
}
