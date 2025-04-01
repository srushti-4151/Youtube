import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToWatchLater, getWatchLater, removeFromWatchLater } from "../controllers/watchlater.controller.js";

const router = Router();

router.post("/:videoId", verifyJWT, addToWatchLater);  // Add video
router.delete("/:videoId", verifyJWT, removeFromWatchLater); // Remove video
router.get("/", verifyJWT, getWatchLater); // Get all watch later videos

export default router;
