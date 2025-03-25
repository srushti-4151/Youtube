import { Router } from 'express';
import {
    checkSubscriptionStatus,
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.get("/status/:username", checkSubscriptionStatus);

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router