import { NodeMailgun } from "ts-mailgun";
import { newUserTemplate } from "./emailtemplates/newuser.template";
import { EmailFormat } from "../events/emailnotify-event";
import { jobStatusTemplate } from "./emailtemplates/jobstatus.template";
import {forgotPasswordTemplate} from "./emailtemplates/forgotpassword.template";

export class Mailer extends NodeMailgun {
  private static apiKey = process.env.MAILGUN_KEY;
  private companyName = "SysbiolPGWAS";
  private static domain = "cubre.waslitbre.org";

  constructor() {
    super(Mailer.apiKey, Mailer.domain);
    this.fromEmail = "noreply@cubre.org";
    this.fromTitle = `${this.companyName} <${this.fromEmail}>`;
    this.init();
  }

  async sendEmail(
    emailPayload: EmailFormat,
    protocol: string = "https",
  ) {
    const { type, recipient, payload } = emailPayload;
    let host = "pgwas.dev";
    if (process.env.NODE_ENV === 'production') {
      host = "spgwas.waslitbre.org";
    }
    let body = "Test 123";
    let subject = "";
    switch (type) {
      case "userRegistration":
        body = newUserTemplate({
          username: payload.username,
          link: `${protocol}://${host}/api/auth/emailconfirm/${recipient.email}/${payload.token}`,
        });
        subject = `Hello ${payload.username}, please verify your email`;
        break;
      case "emailUpdated":
        body = newUserTemplate({
          username: payload.username,
          link: `${protocol}://${host}/api/auth/emailconfirm/${recipient.email}/${payload.token}`,
        });
        subject = `Hello ${payload.username}, please verify your new email`;
        break;
      case "jobStatus":
        body = jobStatusTemplate({
          username: payload?.username,
          status: payload?.status!,
          comments: payload?.comments!,
          jobID: payload?.jobID!,
          jobName: payload?.jobName!,
          link: `${protocol}://${host}/${payload?.link!}`
        });
        subject = `Status of your job: ${payload.jobName}`;
        break;
      case "forgotPassword":
        body = forgotPasswordTemplate({
          username: payload?.username,
          link: `${protocol}://${host}/resetpassword/${payload.token}`,
        });
        subject = `Reset password email`;
        break;
      // case "approvedUser":
      //   body = approvedPersonnelTemplate(payload);
      //   subject = `Hello ${payload.initials} ${payload.lastname}, your profile has been approved`;
      //   break;
    }

    const data = {
      to: recipient.email.trim(),
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
