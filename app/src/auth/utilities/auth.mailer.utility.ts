import { NodeMailgun } from 'ts-mailgun';
import { newUserTemplate } from './emailtemplates/newuser.template';
import { approveUserTemplate } from './emailtemplates/approveuser.template';

export type Recipient = {
  sendEmail: string;
  email?: string;
  responded?: boolean;
  firstname: string;
  lastname: string;
  group?: string;
  sex?: string;
  role?: string;
};

export type MailerData = {
  recipient: Recipient;
  fromEmail: string;
  companyName: string;
};

export class Mailer extends NodeMailgun {
  private static apiKey = process.env.MAILGUN_KEY;
  private companyName = 'CUBRe';
  private static domain = 'cubre.waslitbre.org';

  constructor() {
    super(Mailer.apiKey, Mailer.domain);
    this.fromEmail = 'noreply@cubre.org';
    this.fromTitle = `${this.companyName} <${this.fromEmail}>`;
    this.init();
  }

  async sendEmail(
    type: string = 'newUser',
    recipient: Recipient,
    token?: string,
    protocol: string = 'https',
    host: string = 'cubre.dev',
  ) {
    let body = 'Test 123';
    let subject;
    switch (type) {
      case 'newUser':
        body = newUserTemplate({
          firstname: recipient.firstname,
          link: `${protocol}://${host}/api/auth/emailconfirm/${recipient.email}/${token}`,
        });
        subject = `Hello ${recipient.lastname}, please verify your email`;
        break;
      case 'approveUser':
        body = approveUserTemplate(recipient);
        subject = `Member Approval, please approve ${recipient.lastname}`;
        break;
    }

    const data = {
      to: recipient.sendEmail.trim(),
      subject,
      html: body,
      // 'recipient-variables': this.recipientsVariables,
      // 'o:tracking': true,
      // 'o:tracking-clicks': true,
      // 'o:tracking-opens': true,
    };

    return await this.send(data.to, data.subject, data.html);
  }
}
