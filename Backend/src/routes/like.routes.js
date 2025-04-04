import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getVideoLikesStatus,
    getCommentLikesStatus,
    getTweetLikesStatus,
    getTweetCommentLikesStatus,
    toggleTweetCommentLike,
} from "../controllers/like.controller.js"
import {optionalVerifyJWT, verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.route("/status/c/:commentId").get(optionalVerifyJWT, getCommentLikesStatus);
router.route("/status/v/:videoId").get(optionalVerifyJWT, getVideoLikesStatus);
router.route("/status/t/:tweetId").get(optionalVerifyJWT, getTweetLikesStatus);
router.route("/status/t/c/:tweetComId").get(optionalVerifyJWT, getTweetCommentLikesStatus);



router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/toggle/t/c/:tweetComId").post(toggleTweetCommentLike);

router.route("/videos").get(getLikedVideos);


export default router
