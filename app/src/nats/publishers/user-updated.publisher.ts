import { Publisher } from './base-publisher';
import { Subjects } from '../events/subject';
import { Injectable } from '@nestjs/common';
import { UserUpdatedEvent } from '../events/user-updated.event';

@Injectable()
export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
}
