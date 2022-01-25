import { templateFooter, templateHeader } from "./general.template";

export const forgotPasswordTemplate = (data: {
  username: string;
  link: string;
}) => {
  return `
    ${templateHeader}
        <h3>Please do NOT reply</h3>
        <p>Hello ${data.username}, you are receiving this email because you have made a request to reset your password. Please click the button below to reset your password</p>        
        <a
         style="
            padding: 10px;
            background-color: yellow;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            display: inline-block;
         "
         href="${data.link}">Reset Password</a>
    ${templateFooter}
  `;
};
