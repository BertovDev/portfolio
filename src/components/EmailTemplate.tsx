import * as React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  body: string;
  role: string;
  company: string;
}

const EmailTemplate = ({
  name,
  email,
  body,
  role,
  company,
}: EmailTemplateProps) => {
  return (
    <div>
      <p>Hey {name},</p>
      <p>{body}</p>
      <p>Role: {role}</p>
      <p>Company: {company}</p>
      <p>Email: {email}</p>
    </div>
  );
};

export default EmailTemplate;
