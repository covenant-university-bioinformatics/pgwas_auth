import { Publisher } from './base-publisher';
import { UserApprovedEvent } from '../events/user-approved.event';
import { Subjects } from '../events/subject';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserApprovedPublisher extends Publisher<UserApprovedEvent> {
  subject: Subjects.UserApproved = Subjects.UserApproved;
}
