import { UserRoles } from '../../auth/models/user.model';

export class NewUserDto {
  username: string;
  email: string;
  emailConfirmed: boolean;
  role: UserRoles;
}
