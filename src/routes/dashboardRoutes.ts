import {eventeeDashboard, creatorDashboard } from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireCreator } from "../middlewares/requireCreator";
import {Router} from "express";

const router = Router();

router.get("/creator/dashboard", requireAuth, requireCreator, creatorDashboard);

router.get("/dashboard", requireAuth, eventeeDashboard);




export default router;