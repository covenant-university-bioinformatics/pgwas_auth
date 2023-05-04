import { Client, SendEmailV3_1, LibraryResponse } from "node-mailjet";
import { newUserTemplate } from "./emailtemplates/newuser.template";
import { EmailFormat } from "../events/emailnotify-event";
import { jobStatusTemplate } from "./emailtemplates/jobstatus.template";
import { forgotPasswordTemplate } from "./emailtemplates/forgotpassword.template";

export class Mailer {
  private mailjet: Client;
  private companyName = "SysbiolPGWAS";
  private static domain = "cubre.waslitbre.org";

  constructor() {
    this.mailjet = new Client({
      apiKey: process.env.MJ_APIKEY_PUBLIC!,
      apiSecret: process.env.MJ_APIKEY_PRIVATE!,
    });
  }

  async sendEmail(emailPayload: EmailFormat, protocol: string = "https") {
    const { type, recipient, payload } = emailPayload;
    let host = "pgwas.dev";
    if (process.env.NODE_ENV === "production") {
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
          link: `${protocol}://${host}/${payload?.link!}`,
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

    const data: SendEmailV3_1.Body = {
      Messages: [
        {
          From: {
            Email: "noreply@waslitbre.org",
            Name: this.companyName,
          },
          To: [
            {
              Email: recipient.email.trim(),
              // Name: "Dare Falola",
            },
          ],
          Subject: subject,
          HTMLPart: body,
        },
      ],
    };

    const result: LibraryResponse<SendEmailV3_1.Response> = await this.mailjet
      .post("send", { version: "v3.1" })
      .request(data);

    const { Status } = result.body.Messages[0];

    return Status === "success";
  }
}
