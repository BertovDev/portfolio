import * as React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  body: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  body,
}) => (
  <div>
    <h3>Email: {email}</h3>
    <h3>From: {name}</h3>
    <p>{body}</p>
  </div>
);
