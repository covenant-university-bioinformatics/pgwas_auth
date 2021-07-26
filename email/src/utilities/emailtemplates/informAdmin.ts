import { templateFooter, templateHeader } from "./general.template";

export const informAdminTemplate = (data: {
  token?: string;
  firstname: string;
  lastname: string;
  initials: string;
  email: string;
  sex?: string;
  group?: string;
  role?: string;
  content?: string;
}) => {
  return `
    ${templateHeader}
        <h3 style="text-align: left">Please do NOT reply</h3>
        <p style="text-align: left">Hello, ${data.initials} ${
    data.lastname
  } you have just been registered by admin, please kindly login to use your account</p>
        <p style="text-align: left">More Information</p> 
        <ul style="margin: 20px; text-align: left">
            <li>Lastname: ${data.initials}. ${data.lastname}</li>
            <li>Firstname: ${data.firstname}
            <li>Sex: ${data.sex}</li>
            <li>Email: ${data.email}</li>
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
