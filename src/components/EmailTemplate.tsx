import * as React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  body: string;
  role: string;
  company: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  body,
  role,
  company,
}) => (
  <div>
    <h3>Email: {email}</h3>
    <h3>From: {name}</h3>
    <h4>
      {role} {company}
    </h4>
    <p>{body}</p>
  </div>
);
