import { Router } from "express";
import {  clearWatchHistory, countVideoView, deleteWatchHistoryItem, getWatchHistory } from "../controllers/views.controller.js";
import { optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/:videoId",optionalVerifyJWT, countVideoView); 

// Add a video to watch history (Logged-in user only)
// router.post("/history/:videoId", verifyJWT, addToWatchHistory);

// Get watch history (Paginated)
router.get("/history", verifyJWT, getWatchHistory);
router.delete("/history/clear", verifyJWT, clearWatchHistory);

router.delete("/history/:videoId", verifyJWT, deleteWatchHistoryItem);
export default router;
