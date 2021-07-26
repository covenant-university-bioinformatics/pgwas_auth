import { templateFooter, templateHeader } from "./general.template";

export const newUserTemplate = (data: { username: string; link: string }) => {
  return `
    ${templateHeader}
        <h3>Please do NOT reply</h3>
        <p>Thank you ${data.username} for your registration, please kindly verify your email by clicking the link below</p>        
        <a
         style="
            padding: 10px;
            background-color: yellow;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            display: inline-block;
         "
         href="${data.link}">Verify email</a>
    ${templateFooter}
  `;
};
