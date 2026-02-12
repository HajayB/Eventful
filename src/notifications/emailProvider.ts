import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
});

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
  await transporter.sendMail({
    from: env.email.from,
    to,
    subject,
    html,
  });
};
