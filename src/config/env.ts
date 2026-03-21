
import dotenv from "dotenv";
import path from "path";
import type { SignOptions } from "jsonwebtoken";


dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export const env = {
  appUrl:process.env.APP_BASE_URL as string,
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  jwt: {
    accessExpiresIn:process.env.JWT_ACCESS_EXPIRES_IN ?? "15m" as SignOptions["expiresIn"],
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d" as SignOptions["expiresIn"],
    accessSecret:process.env.ACCESS_SECRET as string,
    refreshSecret:process.env.REFRESH_SECRET as string,
  },

  mongodbUri: process.env.MONGO_URI as string,

  paystack: {
    baseUrl:process.env.PAYSTACK_BASE_URL as string,
    secretKey: process.env.PAYSTACK_SECRET_KEY as string,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY as string,
    paystack_callback_url: process.env.PAYSTACK_CALLBACK_URL as string,
    currency: "NGN",
  },

  email: {
    resend: process.env.RESEND_API_KEY as string, 
    from: process.env.EMAIL_FROM as string,
    admin_email: process.env.ADMIN_EMAIL as string,
    verificationSecret:process.env.EMAIL_VERIFICATION_SECRET as string,
    resetSecret:process.env.EMAIL_RESET_SECRET as string,
  },
};
