import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
    getDashboardAnalytics,
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
 
router.get("/creator/analytics", verifyJWT, getDashboardAnalytics);

export default router