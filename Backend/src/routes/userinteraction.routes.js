import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addUserInteraction, getRecommendedVideos, getTrainingDataHandler, getUserInteractions, getVideoDetails } from "../controllers/userinteraction.controller.js";

const router = Router();
router.use(verifyJWT);
router.get("/recommended-videos", getRecommendedVideos);

router.get("/training-data", getTrainingDataHandler);

router.get("/user-data", getUserInteractions); // Fetch user interactions
router.post("/add", addUserInteraction); // Store interactions

router.post("/video-details", getVideoDetails); 

export default router;


