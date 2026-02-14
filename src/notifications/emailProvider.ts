import { resend } from "../config/email";
import { env } from "../config/env";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailInput) => {
  await resend.emails.send({
    from: env.email.from,
    to,
    subject,
    html,
  });
};
