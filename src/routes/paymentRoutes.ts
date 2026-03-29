import { Router } from "express";
import {
  initializePaymentController,
  paystackWebhookController,
  resendTickets,
  paymentHistoryController,
  guestInitializePaymentController,
  guestResendTicketsController,
} from "../controllers/paymentController";
import { requireAuth } from "../middlewares/requireAuth";
import { createRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// Eventee initializes payment
router.post(
  "/initialize",
  requireAuth,
  createRateLimiter({ windowMs: 60 * 1000, max: 5 }),
  initializePaymentController
);

// Paystack webhook (NO auth)
router.post(
  "/webhook",
  paystackWebhookController
);

//POST /payments/:paymentId/resend-tickets
router.post("/resend-ticket/:paymentRef",
            requireAuth,
            createRateLimiter({windowMs:60 * 1000, max:2}),
            resendTickets);

// GET /payments/history
router.get("/history", requireAuth, paymentHistoryController);

// Guest: no auth, rate limited
router.post(
  "/guest/initialize",
  createRateLimiter({ windowMs: 60 * 1000, max: 5 }),
  guestInitializePaymentController
);

router.post(
  "/guest/resend",
  createRateLimiter({ windowMs: 60 * 1000, max: 3 }),
  guestResendTicketsController
);

export default router;
