import { Message, Stan } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { EmailNotifyEvent } from "./emailnotify-event";
import { Subjects } from "./subject";
import { Mailer } from "../utilities/mailjet.mailer";

export class EmailNotifyListener extends Listener<EmailNotifyEvent> {
  queueGroupName = "email-service";
  readonly subject: Subjects.EmailNotify = Subjects.EmailNotify;
  private mailer: Mailer;

  constructor(client: Stan) {
    super(client);
    this.mailer = new Mailer();
  }
  onMessage(data: EmailNotifyEvent["data"], msg: Message): void {
    console.log("Event data!", data);

    this.mailer
      .sendEmail(data)
      .then((data) => {
        console.log("Email sent: ", data);
        if (data) {
          msg.ack();
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
