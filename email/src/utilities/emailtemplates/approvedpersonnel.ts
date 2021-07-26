import { templateFooter, templateHeader } from "./general.template";

export const approvedPersonnelTemplate = (data: {
  token?: string;
  firstname: string;
  lastname: string;
  email: string;
  initials: string;
  sex?: string;
  group?: string;
  role?: string;
  content?: string;
}) => {
  return `
    ${templateHeader}
        <h3 style="text-align: left">Please do NOT reply</h3>
        <p style="text-align: left">Hello, ${data.initials} ${
    data.firstname
  } Thank you for your registration, your account has been approved by admin</p>
        <p style="text-align: left">More Information</p> 
        <ul style="margin: 20px; text-align: left">
            <li>Lastname: ${data.lastname}</li>
            <li>Firstname: ${data.firstname}
            <li>Sex: ${data.sex}</li>
            <li>Email: ${data.email}</li>
            <li>Research Group: ${data.group}</li>
            <li>Role: ${data.role}</li>
        </ul>
        <a
         style="
            padding: 10px;
            background-color: yellow;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            display: ${data.sex ? "block" : "inline-block"};
         "
         href="#">Login</a>
    ${templateFooter}
  `;
};
