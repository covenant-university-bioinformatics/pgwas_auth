import { Publisher } from './base-publisher';

import { Subjects } from '../events/subject';
import { Injectable } from '@nestjs/common';
import { EmailNotifyEvent } from '../events/emailnotify-event';

@Injectable()
export class EmailNotifyPublisher extends Publisher<EmailNotifyEvent> {
  subject: Subjects.EmailNotify = Subjects.EmailNotify;
}
