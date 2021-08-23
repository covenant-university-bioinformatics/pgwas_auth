import { Subjects } from "./subject";

export enum emailType {
  newUser = "userRegistration",
  emailUpdated = "emailUpdated",
  approvedUser = "approvedUser",
  informAdmin = "informAdmin",
  jobStatus = "jobStatus",
}

export type EmailFormat = {
  type: emailType;
  recipient: {
    email: string;
    name?: string;
  };
  payload: {
    token?: string;
    username: string;
    content?: string;
    status?: string;
    comments?: string;
    jobID?: string;
    jobName?: string;
    link?: string;
  };
};
export interface EmailNotifyEvent {
  subject: Subjects.EmailNotify;
  data: EmailFormat;
}
