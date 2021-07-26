import { templateFooter, templateHeader } from "./general.template";

export const jobStatusTemplate = (data: {
  username: string;
  status: string;
  comments: string;
  jobID: string;
  jobName: string;
}) => {
  return `
    ${templateHeader}
        <h3>Please do NOT reply</h3>
        <p>Hello ${data.username}, please find information below about your job</p>
        <p>Job Name: ${data.jobName}</p>
        <p>Job ID: ${data.jobID}</p>
        <p>Status: ${data.status}</p>
        <p>Comments:</p>
        <p>${data.comments}</p>
    ${templateFooter}
  `;
};
