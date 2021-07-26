import { Stan } from 'node-nats-streaming';
import { Subjects } from '../events/subject';
import { Inject } from '@nestjs/common';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  @Inject('NatsClient') private client: Stan;
  abstract subject: T['subject'];

  constructor() {}

  publish(data: T['data']): Promise<void> {
    console.log(this.subject, JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          console.log(err);
          return reject(err);
        } else {
          console.log('Event published ', this.subject);
          resolve();
        }
      });
    });
  }
}
