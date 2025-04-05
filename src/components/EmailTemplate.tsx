import * as React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  company?: string;
  subject: string;
  body: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  company,
  subject,
  body,
}) => (
  <div>
    <h3>Email: {email}</h3>
    <h3>From: {name}</h3>
    <h3>Subject: {subject}</h3>
    <h3>Company: {company}</h3>
    <p>{body}</p>
  </div>
);
