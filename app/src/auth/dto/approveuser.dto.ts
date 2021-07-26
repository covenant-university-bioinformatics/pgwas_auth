import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsEnum,
} from 'class-validator';

enum APPROVAL_STATUS {
  DENY = 'deny',
  APPROVE = 'approve',
  PENDING = 'pending',
}

export class ApproveUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsEmail()
  @Matches(
    /^[a-zA-Z0-9!#$&_*?^{~.-]+(\.[a-zA-Z0-9!#$&_*?^{~.-])*@(stu\.)?(cu|covenantuniversity){1}(\.edu\.ng){1}$/,
    {
      message: 'Approval failed, there is an issue with the email',
    },
  )
  email: string;

  @IsEnum(APPROVAL_STATUS)
  status: APPROVAL_STATUS;
}
