import { Request, Response } from "express";
import { getEventeeDashboard } from "../services/dashboardService";
import { getCreatorDashboard } from "../services/dashboardService";

export const creatorDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const creatorId = req.user!.userId.toString();

    const dashboard = await getCreatorDashboard(creatorId);

    return res.status(200).json(dashboard);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Failed to load dashboard",
    });
  }
};
export const eventeeDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();
    const dashboard = await getEventeeDashboard(userId);

    return res.status(200).json(dashboard);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Failed to load dashboard",
    });
  }
};