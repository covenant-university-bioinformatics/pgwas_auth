import { Subjects } from './subject';

export interface UserEmailConfirmEvent {
  subject: Subjects.EmailConfirm;
  data: {
    username: string;
    email: string;
    emailConfirmed: boolean;
  };
}
