import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Get videoId from request parameters

  //  Step 1: Validate `videoId`
  if (!videoId) {
    throw new ApiError(400, "Video Id is Required"); // If no videoId is provided, return an error
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID"); // Check if the provided ID is a valid MongoDB ObjectId
  }

  //  Step 2: Check if the video exists in the database
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found"); // If video doesn't exist, return a 404 error
  }

  //  Step 3: Check if the user has already liked the video
  const isLiked = await Like.findOne({
    video: new mongoose.Types.ObjectId(videoId), // Convert videoId to ObjectId
    likedBy: req.user?._id, // Check if the logged-in user has liked the video
  });

  //  Step 4: Toggle the like status
  if (isLiked) {
    //  If the video is already liked, remove the like (dislike)
    await Like.findByIdAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video disliked successfully"));
  } else {
    //  If the video is not liked, create a new like entry
    const newLike = await Like.create({
      video: new mongoose.Types.ObjectId(videoId), // Store video reference
      likedBy: req.user?._id, // Store user reference
    });

    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(400, "Video Id is Required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  const isLiked = await Like.findOne({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: req.user?._id,
  });

  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment disliked successfully"));
  } else {
    const newLike = await Like.create({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Check if tweetId exists first, then validate it (fixed comment)
  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is Required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  // Check if tweet exists in Tweet model before proceeding (fixed comment)
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const isLiked = await Like.findOne({
    tweet: new mongoose.Types.ObjectId(tweetId),
    likedBy: req.user?._id,
  });

  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Dislike Tweet Successfully"));
  } else {
    const newLike = await Like.create({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Liked Tweet Successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  // What is populate?
  // Mongoose’s .populate() replaces the video field (which is an ObjectId) with the actual video document from the Video collection.
  // Why?
  // Normally, a Like document stores only a videoId, but we need full video details (title, thumbnail, etc.).
  // How?
  // path: "video" → Tells Mongoose to replace videoId with actual video data.
  // select: "..." → Fetches only the required fields (_id, thumbnail, etc.).
  // match: { isPublished: true } → Filters out unpublished videos.
  // If a video is unpublished, populate() sets video: null.

  const { page = 1, limit = 10 } = req.query;
  // Validate page number
  if (page < 1) {
    throw new ApiError(400, "Invalid page number");
  }

  const likes = await Like.find({
    likedBy: req.user?._id,
    video: { $exists: true },
  })
    .populate({
      path: "video",
      select: "_id thumbnail title description duration views isPublished",
      match: { isPublished: true }, //If a video is unpublished then populate() sets video: null.
    })
    .skip((page - 1) * limit)
    .limit(limit);

  //Since .populate() returns null for unpublished videos, we filter them out to ensure only published videos are shown.
  const filteredLikes = likes.filter((like) => like.video !== null);

  const totalLikedVideos = await Like.countDocuments({
    likedBy: req.user?._id,
    video: { $exists: true },
  });

  // Calculate pagination details
  const totalPages = Math.ceil(totalLikedVideos / limit); //rounds a number up to the nearest integer.
  const pagination = {
    totalPages,
    currentPage: Number(page),
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    totalLikedVideos,
  };

  if (filteredLikes.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          videos: [],
          pagination,
        },
        "No liked videos found"
      )
    );
  }

  // Extract only video details from likes
  //The filteredLikes array contains Like objects, each with a populated video field.
  //.map(like => like.video) extracts only the video details from each Like object.

  const videos = filteredLikes.map((like) => like.video);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination,
      },
      "Liked videos fetched successfully"
    )
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
