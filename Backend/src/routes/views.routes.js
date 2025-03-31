import { Router } from "express";
import { addToWatchHistory, countVideoView, getWatchHistory } from "../controllers/views.controller.js";
import { optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/:videoId",optionalVerifyJWT, countVideoView); 

// Add a video to watch history (Logged-in user only)
router.post("/history/:videoId", verifyJWT, addToWatchHistory);

// Get watch history (Paginated)
router.get("/history", verifyJWT, getWatchHistory);
export default router;
