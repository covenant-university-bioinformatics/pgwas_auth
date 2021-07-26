import { Publisher } from './base-publisher';
import { Subjects } from '../events/subject';
import { Injectable } from '@nestjs/common';
import { UserDeletedEvent } from '../events/user-delete.event';

@Injectable()
export class UserDeletedPublisher extends Publisher<UserDeletedEvent> {
  subject: Subjects.UserDeleted = Subjects.UserDeleted;
}
