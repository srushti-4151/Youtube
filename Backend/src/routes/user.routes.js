import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, verifyOtp, resendOtp, sendResetOtp, verifyResetOtp, resetPassword, resendResetOtp } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-otp", resendResetOtp);

// Verify OTP for email verification
router.route("/verify-otp").post(verifyOtp);
router.route("/resendOtp").post(resendOtp);

// Resend OTP (in case user didn't receive it)
router.route("/resend-otp").post(resendOtp);

router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
// router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/avatar").patch((req, res, next) => {
  console.log("Before verifyJWT");
  next();
}, verifyJWT, (req, res, next) => {
  console.log("After verifyJWT");
  next();
}, upload.single("avatar"), updateUserAvatar);

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);
export default router;
