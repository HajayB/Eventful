
import { Request, Response } from "express";
import {
  getCreatorAllTimeAnalytics,
  getCreatorEventAnalytics,
  getEventeePaidEvents,
  getEventeeAttendedEvents,
  getEventeeUnattendedEvents,
} from "../services/analyticsService";
import { getCreatorPaymentAnalytics } from "../services/analyticsService";

/**
 * CREATOR: All-time analytics
 * GET /analytics/creator
 */
export const creatorAllTimeAnalyticsController = async (
  req: Request,
  res: Response
) => {
  try {
    const creatorId = req.user!.userId.toString();

    const analytics = await getCreatorAllTimeAnalytics(creatorId);

    res.status(200).json(analytics);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to fetch analytics",
    });
  }
};

/**
 * CREATOR: Per-event analytics
 * GET /analytics/creator/:eventId
 */
export const creatorEventAnalyticsController = async (
  req: Request,
  res: Response
) => {
  try {
    const creatorId = req.user!.userId.toString();
    const eventId  = req.params.eventId as string;

    const analytics = await getCreatorEventAnalytics(
      creatorId,
      eventId
    );

    res.status(200).json(analytics);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to fetch event analytics",
    });
  }
};

export const creatorPaymentAnalytics = async (req:Request, res:Response) => {
  const creatorId = req.user!.userId.toString();

  const analytics = await getCreatorPaymentAnalytics({
    creatorId,
  });

  res.json(analytics);
};
/**
 * EVENTEE: Events paid for
 * GET /analytics/eventee/paid
 */
export const eventeePaidEventsController = async (
  req: Request,
  res: Response
) => {
  try {
    const eventeeId = req.user!.userId.toString();

    const events = await getEventeePaidEvents(eventeeId);
    

    res.status(200).json(events);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to fetch paid events",
    });
  }
};

/**
 * EVENTEE: Events attended (QR verified)
 * GET /analytics/eventee/attended
 */
export const eventeeAttendedEventsController = async (
  req: Request,
  res: Response
) => {
  try {
    const eventeeId = req.user!.userId.toString(); 

    const events = await getEventeeAttendedEvents(eventeeId);

    res.status(200).json(events);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to fetch attended events",
    });
  }
};

/**
 * EVENTEE: Paid but not attended
 * GET /analytics/eventee/unattended
 */
export const eventeeUnattendedEventsController = async (
  req: Request,
  res: Response
) => {
  try {
    const eventeeId = req.user!.userId.toString();

    const events = await getEventeeUnattendedEvents(eventeeId);

    res.status(200).json(events);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to fetch unattended events",
    });
  }
};
