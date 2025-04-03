import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addTweetComment, getTweetComments } from '../controllers/tweetcomment.controller.js';

const router = Router();
router.route("/ct/:tweetId").get(getTweetComments)

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/ct/:tweetId").post(addTweetComment);
// router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router