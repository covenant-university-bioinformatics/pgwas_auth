import { Publisher } from './base-publisher';
import { Subjects } from '../events/subject';
import { Injectable } from '@nestjs/common';
import { UserEmailConfirmEvent } from '../events/user-emailConfirm.event';

@Injectable()
export class EmailConfirmPublisher extends Publisher<UserEmailConfirmEvent> {
  subject: Subjects.EmailConfirm = Subjects.EmailConfirm;
}
