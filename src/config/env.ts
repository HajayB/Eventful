
import dotenv from "dotenv";
import path from "path";
import type { SignOptions } from "jsonwebtoken";


dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" as SignOptions["expiresIn"],
  },

  mongodbUri: process.env.MONGO_URI as string,

  redisUrl: process.env.REDIS_URL as string,

  paystack: {
    baseUrl:process.env.PAYSTACK_BASE_URL as string,
    secretKey: process.env.PAYSTACK_SECRET_KEY as string,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY as string,
    paystack_callback_url: process.env.PAYSTACK_CALLBACK_URL as string,
    currency: "NGN",
  },

  email: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
    from: process.env.EMAIL_FROM as string,
  },
};
