import { Router } from 'express';
import {
    checkSubscriptionStatus,
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.get("/status/:username",verifyJWT, checkSubscriptionStatus);

// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(verifyJWT, getUserChannelSubscribers)
    .post(verifyJWT, toggleSubscription);

router.route("/u/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router