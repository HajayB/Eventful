import { Router } from "express";
import {
  scanTicketController,
  getMyTicketsController,
} from "../controllers/ticketController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireCreator } from "../middlewares/requireCreator";
import { createRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// Eventee: view eventee tickets
router.get(
  "/me",
  requireAuth,
  getMyTicketsController
);

// Creator: scan ticket
router.post(
  "/scan",
  requireAuth,
  requireCreator,
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }),
  scanTicketController
);

export default router;
