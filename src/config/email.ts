import { Resend } from "resend";
import { env } from "./env";

interface EmailConfig {
  appUrl:string;
  resend: string;
  EMAIL_FROM: string;
  ADMIN_EMAIL:string;
  frontendUrl:string;
}

const emailConfig: EmailConfig = {
  appUrl:env.appUrl,
  frontendUrl:env.frontendUrl,
  resend: env.email.resend,
  EMAIL_FROM: env.email.from,
  ADMIN_EMAIL:env.email.admin_email,
};

const resend = new Resend(emailConfig.resend);

export { resend, emailConfig };
