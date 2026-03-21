import { Router } from "express";

import authRoutes from "./authRoutes";
import eventRoutes from "./eventRoutes";
import ticketRoutes from "./ticketRoutes";
import paymentRoutes from "./paymentRoutes";
import analyticsRoutes from "./analyticsRoutes";
import notificationRoutes from "./notificationRoutes";
import dashboardRoutes from "./dashboardRoutes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/tickets", ticketRoutes);
router.use("/payments", paymentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/notifications", notificationRoutes);
router.use("/", dashboardRoutes)

export default router;
