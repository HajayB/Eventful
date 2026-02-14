import { Resend } from "resend";
import { env } from "./env";

interface EmailConfig {
  resend: string;
  EMAIL_FROM: string;
}

const emailConfig: EmailConfig = {
  resend: env.email.resend,
  EMAIL_FROM: env.email.from,
};

const resend = new Resend(emailConfig.resend);

export { resend, emailConfig };
