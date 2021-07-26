import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subject';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  protected ackWait = 5 * 1000;
  abstract onMessage(data: T['data'], msg: Message): void;
  constructor(private client: Stan) {}

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable() //send all events to a new service
      .setManualAckMode(true) //manually acknowledge consumption of event
      .setAckWait(this.ackWait) //number of seconds to wait for service to acknowledge receipt
      .setDurableName(this.queueGroupName); //keep processed events and send only unprocessed;
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject, //channel name
      this.queueGroupName,
      this.subscriptionOptions(),
    );

    subscription.on('message', (msg: Message) => {
      console.log(`Message received ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data) //parse string
      : JSON.parse(data.toString('utf8')); //parse buffer
  }
}
