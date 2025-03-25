import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  getAllVideosById,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Routes that do not require authentication
router.route("/all").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

// Routes that require authentication
router
  .route("/")
  .get(verifyJWT, getAllVideosById)
  .post(
    verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
  );

router
  .route("/:videoId")
  .delete(verifyJWT, deleteVideo)
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;


// import { Router } from "express";
// import {
//   deleteVideo,
//   getAllVideos,
//   getVideoById,
//   publishAVideo,
//   togglePublishStatus,
//   updateVideo,
//   getAllVideosById
// } from "../controllers/video.controller.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router
//   .route("/")
//   .get(getAllVideosById)
//   .post(
//     upload.fields([
//       {
//         name: "videoFile",
//         maxCount: 1,
//       },
//       {
//         name: "thumbnail",
//         maxCount: 1,
//       },
//     ]),
//     publishAVideo
//   );
// router.route("/all").get(getAllVideos);
// router
//   .route("/:videoId")
  
//   .get(getVideoById)
//   .delete(deleteVideo)
//   .patch(upload.single("thumbnail"), updateVideo);

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

// export default router;
