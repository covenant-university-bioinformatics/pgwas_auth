import { Module, OnModuleInit } from '@nestjs/common';
import { natsFactory } from './natsclient.factory';
import { EmailNotifyPublisher } from './publishers/emialnotify.publisher';
import { UserApprovedPublisher } from './publishers/user-approved-publisher';
import { UserUpdatedPublisher } from './publishers/user-updated.publisher';
import { UserDeletedPublisher } from './publishers/user-deleted.publisher';
import { EmailConfirmPublisher } from './publishers/user-emailconfirm-publisher';

@Module({
  providers: [
    natsFactory,
    EmailNotifyPublisher,
    UserApprovedPublisher,
    UserUpdatedPublisher,
    UserDeletedPublisher,
    EmailConfirmPublisher,
  ],
  exports: [
    EmailNotifyPublisher,
    UserApprovedPublisher,
    UserUpdatedPublisher,
    UserDeletedPublisher,
    EmailConfirmPublisher,
  ],
})
export class NatsModule implements OnModuleInit {
  onModuleInit() {
    console.log(`The NATS module has been initialized.`);
  }
}
