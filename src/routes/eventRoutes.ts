import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getSingleEvent,
  getCreatorEvents,
  updateEvent,
  deleteEvent, shareEvent
} from "../controllers/eventController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireCreator } from "../middlewares/requireCreator";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createEventSchema,
  updateEventSchema,
} from "../validation/eventValidation";

const router = Router();

// Public
router.get("/", getAllEvents);
router.get("/:eventId", getSingleEvent); 

router.get("/share/:eventId", shareEvent);
// Creator
router.post(
  "/",
  requireAuth,
  requireCreator,
  validateRequest(createEventSchema),
  createEvent
);

router.get(
  "/creator/me",
  requireAuth,
  requireCreator,
  getCreatorEvents
);

router.put(
  "/:eventId",
  requireAuth,
  requireCreator,
  validateRequest(updateEventSchema),
  updateEvent
);

router.delete(
  "/:eventId",
  requireAuth,
  requireCreator,
  deleteEvent
);

export default router;
