
import { env } from "./env";

export const paystackConfig = {
  baseUrl: env.paystack.baseUrl,

  secretKey: env.paystack.secretKey,
  publicKey: env.paystack.publicKey,
  callback_url: env.paystack.paystack_callback_url,

  headers: {
    Authorization: `Bearer ${env.paystack.secretKey}`,
    "Content-Type": "application/json",
  },
};