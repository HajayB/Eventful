interface EmailConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  }
  
  export const emailConfig: EmailConfig = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
    from: process.env.EMAIL_FROM as string,
  };
  