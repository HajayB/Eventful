import { Router } from "express";
import {
  creatorAllTimeAnalyticsController,
  creatorEventAnalyticsController,
  eventeePaidEventsController,
  eventeeAttendedEventsController,
  eventeeUnattendedEventsController,
  creatorPaymentAnalytics,
} from "../controllers/analyticsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireCreator } from "../middlewares/requireCreator";

const router = Router();

// Creator analytics
router.get(
  "/creator",
  requireAuth,
  requireCreator,
  creatorAllTimeAnalyticsController
);
router.get(
  "/creator/payments",
  requireAuth,
  requireCreator,
  creatorPaymentAnalytics
);
router.get(
  "/creator/:eventId",
  requireAuth,
  requireCreator,
  creatorEventAnalyticsController
);



// Eventee analytics
router.get(
  "/eventee/paid",
  requireAuth,
  eventeePaidEventsController
);

router.get(
  "/eventee/attended",
  requireAuth,
  eventeeAttendedEventsController
);

router.get(
  "/eventee/unattended",
  requireAuth,
  eventeeUnattendedEventsController
);


export default router;
