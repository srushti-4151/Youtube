import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

// const toggleVideoLike = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;
//   const { type } = req.body;
//   const userId = req.user?._id;

//   // Validate videoId
//   if (!videoId) throw new ApiError(400, "Video ID is required");
//   if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

//   // Check if the video exists
//   const video = await Video.findById(videoId);
//   if (!video) throw new ApiError(404, "Video not found");

//   // Aggregation to fetch updated counts and user reaction
//   const updatedStats = await Like.aggregate([
//     { $match: { video: new mongoose.Types.ObjectId(videoId) } },
//     {
//       $group: {
//         _id: "$video",
//         likesCount: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
//         dislikesCount: { $sum: { $cond: [{ $eq: ["$type", "dislike"] }, 1, 0] } },
//         likedByUsers: { $push: { type: "$type", user: { $toString: "$likedBy" } } },
//       },
//     },
//     {
//       $addFields: {
//         isLiked: {
//           $gt: [
//             {
//               $size: {
//                 $filter: {
//                   input: "$likedByUsers",
//                   as: "like",
//                   cond: {
//                     $and: [
//                       { $eq: ["$$like.type", "like"] },
//                       { $eq: ["$$like.user", userId.toString()] },
//                     ],
//                   },
//                 },
//               },
//             },
//             0,
//           ],
//         },
//         isDisliked: {
//           $gt: [
//             {
//               $size: {
//                 $filter: {
//                   input: "$likedByUsers",
//                   as: "dislike",
//                   cond: {
//                     $and: [
//                       { $eq: ["$$dislike.type", "dislike"] },
//                       { $eq: ["$$dislike.user", userId.toString()] },
//                     ],
//                   },
//                 },
//               },
//             },
//             0,
//           ],
//         },
//       },
//     },
//     { $project: { likedByUsers: 0 } }, // Remove unnecessary data
//   ]);

//   // Default stats if no likes/dislikes exist
//   const stats = updatedStats[0] || {
//     likesCount: 0,
//     dislikesCount: 0,
//     isLiked: false,
//     isDisliked: false,
//   };

//   return res.status(200).json(new ApiResponse(200, stats, message));
// });

const getVideoLikesStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id || null;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");


  const result = await Like.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },

    {
      $group: {
        _id: "$video",
        likesCount: {
          $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] },
        },
        dislikesCount: {
          $sum: { $cond: [{ $eq: ["$type", "dislike"] }, 1, 0] },
        },
        userReaction: {
          $push: {
            likedBy: "$likedBy",
            type: "$type",
          },
        },
      },
    },
    {
      $addFields: {
        isLiked: userId ? {
          $in: [
            new mongoose.Types.ObjectId(userId),
            {
              $map: {
                input: {
                  $filter: {
                    input: "$userReaction",
                    as: "reaction",
                    cond: { $eq: ["$$reaction.type", "like"] },
                  },
                },
                as: "filteredLike",
                in: "$$filteredLike.likedBy",
              },
            },
          ],
        } : false,
        isDisliked: userId ? {
          $in: [
            new mongoose.Types.ObjectId(userId),
            {
              $map: {
                input: {
                  $filter: {
                    input: "$userReaction",
                    as: "reaction",
                    cond: { $eq: ["$$reaction.type", "dislike"] },
                  },
                },
                as: "filteredDislike",
                in: "$$filteredDislike.likedBy",
              },
            },
          ],
        } : false,
      },
    },
    { $project: { userReaction: 0 } }, // Remove unnecessary fields
  ]);

  if (!result.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false, isDisliked: false, likesCount: 0, dislikesCount: 0 }, "Video like status fetched successfully"));
  }

  return res.status(200).json(new ApiResponse(200, result[0], "Video like status fetched successfully"));
});

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Get videoId from request parameters
  const { type } = req.body;
  // console.log("video id for toggle", videoId, "Type:", type);
  //   console.log("User ID:", req.user?._id);

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
  const existingReaction = await Like.findOne({
    video: new mongoose.Types.ObjectId(videoId), // Convert videoId to ObjectId
    likedBy: req.user?._id, // Check if the logged-in user has liked the video
  });

  //  Step 4: Toggle the like status
  if (existingReaction) {
    if (existingReaction.type === type) {
      // If pressing the same reaction again, remove it (toggle off)
      await Like.findByIdAndDelete(existingReaction._id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, `${type} removed successfully`));
    } else {
      // If switching between Like & Dislike, update type
      existingReaction.type = type;
      await existingReaction.save();
      return res
        .status(200)
        .json(
          new ApiResponse(200, existingReaction, `Video ${type}d successfully`)
        );
    }
  } else {
    // If no previous reaction, create a new one
    const newReaction = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: req.user?._id,
      type,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newReaction, `Video ${type}d successfully`));
  }
});

const getCommentLikesStatus = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id || null;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const result = await Like.aggregate([
    { $match: { comment: new mongoose.Types.ObjectId(commentId) } },
    {
      $group: {
        _id: "$comment",
        likesCount: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
        dislikesCount: { $sum: { $cond: [{ $eq: ["$type", "dislike"] }, 1, 0] } },
        userReaction: { $push: { likedBy: "$likedBy", type: "$type" } },
      },
    },
    {
      $addFields: {
        isLiked: userId ? {
          $in: [
            new mongoose.Types.ObjectId(userId),
            {
              $map: {
                input: { $filter: { input: "$userReaction", as: "reaction", cond: { $eq: ["$$reaction.type", "like"] } } },
                as: "filteredLike",
                in: "$$filteredLike.likedBy",
              },
            },
          ],
        } : false ,
        isDisliked: userId ? {
          $in: [
            new mongoose.Types.ObjectId(userId),
            {
              $map: {
                input: { $filter: { input: "$userReaction", as: "reaction", cond: { $eq: ["$$reaction.type", "dislike"] } } },
                as: "filteredDislike",
                in: "$$filteredDislike.likedBy",
              },
            },
          ],
        } : false ,
      },
    },
    { $project: { userReaction: 0 } },
  ]);

  if (!result.length) {
    return res.status(200).json(
      new ApiResponse(200, { 
        commentId, 
        isLiked: false, 
        isDisliked: false, 
        likesCount: 0, 
        dislikesCount: 0 
      }, "Comment like status fetched successfully")
    );
  }

  const responseData = {
    commentId,  // Add the commentId explicitly
    likesCount: result[0].likesCount || 0,
    dislikesCount: result[0].dislikesCount || 0,
    isLiked: result[0].isLiked || false,
    isDisliked: result[0].isDisliked || false
  };

  return res.status(200).json(new ApiResponse(200, responseData, "Comment like status fetched successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { type } = req.body;

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

  const existingReaction = await Like.findOne({ comment: commentId, likedBy: req.user?._id });

  if (existingReaction) {
    if (existingReaction.type === type) {
      await Like.findByIdAndDelete(existingReaction._id);
      return res.status(200).json(new ApiResponse(200, {}, `${type} removed successfully`));
    } else {
      existingReaction.type = type;
      await existingReaction.save();
      return res.status(200).json(new ApiResponse(200, existingReaction, `Comment ${type}d successfully`));
    }
  } else {
    const newReaction = await Like.create({ comment: commentId, likedBy: req.user?._id, type });
    return res.status(200).json(new ApiResponse(200, newReaction, `Comment ${type}d successfully`));
  }
});

const getTweetLikesStatus = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id || null;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet not found");

  const result = await Like.aggregate([
    { $match: { tweet: new mongoose.Types.ObjectId(tweetId) } },
    {
      $group: {
        _id: "$tweet",
        likesCount: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
        dislikesCount: { $sum: { $cond: [{ $eq: ["$type", "dislike"] }, 1, 0] } },
        userReaction: { $push: { likedBy: "$likedBy", type: "$type" } },
      },
    },
    {
      $addFields: {
        isLiked: userId ? {
          $in: [
            new mongoose.Types.ObjectId(userId),
            {
              $map: {
                input: { $filter: { input: "$userReaction", as: "reaction", cond: { $eq: ["$$reaction.type", "like"] } } },
                as: "filteredLike",
                in: "$$filteredLike.likedBy",
              },
            },
          ],
        } : false,
        isDisliked: userId ? {
          $in: [
            new mongoose.Types.ObjectId(userId),
            {
              $map: {
                input: { $filter: { input: "$userReaction", as: "reaction", cond: { $eq: ["$$reaction.type", "dislike"] } } },
                as: "filteredDislike",
                in: "$$filteredDislike.likedBy",
              },
            },
          ],
        } : false,
      },
    },
    { $project: { userReaction: 0 } },
  ]);

  if (!result.length) {
    return res.status(200).json(
      new ApiResponse(200, { 
        tweetId, 
        isLiked: false, 
        isDisliked: false, 
        likesCount: 0, 
        dislikesCount: 0 
      }, "tweet like status fetched successfully")
    );
  }

  const responseData = {
    tweetId,  // Add the tweetId explicitly
    likesCount: result[0].likesCount || 0,
    dislikesCount: result[0].dislikesCount || 0,
    isLiked: result[0].isLiked || false,
    isDisliked: result[0].isDisliked || false
  };

  return res.status(200).json(new ApiResponse(200, responseData, "tweet like status fetched successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { type } = req.body;

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

  const existingReaction = await Like.findOne({ 
    tweet: new mongoose.Types.ObjectId(tweetId), 
    likedBy: req.user?._id
   });

  if (existingReaction) {
    if (existingReaction.type === type) {
      await Like.findByIdAndDelete(existingReaction._id);
      return res.status(200).json(new ApiResponse(200, {}, `${type} removed successfully`));
    } else {
      existingReaction.type = type;
      await existingReaction.save();
      return res.status(200).json(new ApiResponse(200, existingReaction, `Tweet ${type}d successfully`));
    }
  } else {
    const newReaction = await Like.create({ 
      tweet: new mongoose.Types.ObjectId(tweetId), 
      likedBy: req.user?._id,
      type 
    });
    return res.status(200).json(new ApiResponse(200, newReaction, `Tweet ${type}d successfully`));
  }
});

// Get Tweet Like Status
// const getTweetLikesStatus = asyncHandler(async (req, res) => {
//   const { tweetId } = req.params;
//   const userId = req.user?._id || null;

//   if (!isValidObjectId(tweetId)) {
//     throw new ApiError(400, "Invalid Tweet ID");
//   }

//   const tweet = await Tweet.findById(tweetId);
//   if (!tweet) throw new ApiError(404, "Tweet not found");

//   const result = await Like.aggregate([
//     { $match: { tweet: new mongoose.Types.ObjectId(tweetId) } },
//     {
//       $group: {
//         _id: "$tweet",
//         likesCount: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
//         dislikesCount: { $sum: { $cond: [{ $eq: ["$type", "dislike"] }, 1, 0] } },
//         userReaction: { $push: { likedBy: "$likedBy", type: "$type" } },
//       },
//     },
//     {
//       $addFields: {
//         isLiked: userId ? {
//           $in: [
//             new mongoose.Types.ObjectId(userId),
//             {
//               $map: {
//                 input: { $filter: { input: "$userReaction", as: "reaction", cond: { $eq: ["$$reaction.type", "like"] } } },
//                 as: "filteredLike",
//                 in: "$$filteredLike.likedBy",
//               },
//             },
//           ],
//         } : false,
//         isDisliked: userId ? {
//           $in: [
//             new mongoose.Types.ObjectId(userId),
//             {
//               $map: {
//                 input: { $filter: { input: "$userReaction", as: "reaction", cond: { $eq: ["$$reaction.type", "dislike"] } } },
//                 as: "filteredDislike",
//                 in: "$$filteredDislike.likedBy",
//               },
//             },
//           ],
//         } : false,
//       },
//     },
//     { $project: { userReaction: 0 } },
//   ]);

//   if (!result.length) {
//     return res.status(200).json(new ApiResponse(200, { isLiked: false, isDisliked: false, likesCount: 0, dislikesCount: 0 }, "Tweet like status fetched successfully"));
//   }

//   return res.status(200).json(new ApiResponse(200, result[0], "Tweet like status fetched successfully"));
// });

// const toggleTweetLike = asyncHandler(async (req, res) => {
//   const { tweetId } = req.params;
//   const { type } = req.body;

//   // Check if tweetId exists first, then validate it (fixed comment)
//   if (!tweetId) {
//     throw new ApiError(400, "Tweet Id is Required");
//   }

//   if (!isValidObjectId(tweetId)) {
//     throw new ApiError(400, "Invalid Tweet ID");
//   }

//   // Check if tweet exists in Tweet model before proceeding (fixed comment)
//   const tweet = await Tweet.findById(tweetId);
//   if (!tweet) {
//     throw new ApiError(404, "Tweet not found");
//   }

//   const existingReaction = await Like.findOne({ 
//     tweet: new mongoose.Types.ObjectId(tweetId), 
//     likedBy: req.user?._id
//    });

//   if (existingReaction) {
//     if (existingReaction.type === type) {
//       await Like.findByIdAndDelete(existingReaction._id);
//       return res.status(200).json(new ApiResponse(200, {}, `${type} removed successfully`));
//     } else {
//       existingReaction.type = type;
//       await existingReaction.save();
//       return res.status(200).json(new ApiResponse(200, existingReaction, `Tweet ${type}d successfully`));
//     }
//   } else {
//     const newReaction = await Like.create({ 
//       tweet: new mongoose.Types.ObjectId(tweetId), 
//       likedBy: req.user?._id,
//       type 
//     });
//     return res.status(200).json(new ApiResponse(200, newReaction, `Tweet ${type}d successfully`));
//   }
// });

// const getLikedVideos = asyncHandler(async (req, res) => {
//   //TODO: get all liked videos
//   // What is populate?
//   // Mongoose’s .populate() replaces the video field (which is an ObjectId) with the actual video document from the Video collection.
//   // Why?
//   // Normally, a Like document stores only a videoId, but we need full video details (title, thumbnail, etc.).
//   // How?
//   // path: "video" → Tells Mongoose to replace videoId with actual video data.
//   // select: "..." → Fetches only the required fields (_id, thumbnail, etc.).
//   // match: { isPublished: true } → Filters out unpublished videos.
//   // If a video is unpublished, populate() sets video: null.

//   const { page = 1, limit = 10 } = req.query;
//   // Validate page number
//   if (page < 1) {
//     throw new ApiError(400, "Invalid page number");
//   }

//   const likes = await Like.find({
//     likedBy: req.user?._id,
//     video: { $exists: true },
//   })
//     .populate({
//       path: "video",
//       select: "_id thumbnail title description duration views isPublished",
//       match: { isPublished: true }, //If a video is unpublished then populate() sets video: null.
//     })
//     .skip((page - 1) * limit)
//     .limit(limit);

//   //Since .populate() returns null for unpublished videos, we filter them out to ensure only published videos are shown.
//   const filteredLikes = likes.filter((like) => like.video !== null);

//   const totalLikedVideos = await Like.countDocuments({
//     likedBy: req.user?._id,
//     video: { $exists: true },
//   });

//   // Calculate pagination details
//   const totalPages = Math.ceil(totalLikedVideos / limit); //rounds a number up to the nearest integer.
//   const pagination = {
//     totalPages,
//     currentPage: Number(page),
//     hasNextPage: page < totalPages,
//     hasPreviousPage: page > 1,
//     totalLikedVideos,
//   };

//   if (filteredLikes.length === 0) {
//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         {
//           videos: [],
//           pagination,
//         },
//         "No liked videos found"
//       )
//     );
//   }

//   // Extract only video details from likes
//   //The filteredLikes array contains Like objects, each with a populated video field.
//   //.map(like => like.video) extracts only the video details from each Like object.

//   const videos = filteredLikes.map((like) => like.video);

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         videos,
//         pagination,
//       },
//       "Liked videos fetched successfully"
//     )
//   );
// });

// const getLikedVideos = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10 } = req.query;
//   if (page < 1) {
//     throw new ApiError(400, "Invalid page number");
//   }

//   const skip = (page - 1) * limit;

//   const results = await Like.aggregate([
//     // Match likes by the logged-in user
//     { $match: { likedBy: req.user?._id } },

//     // Lookup (similar to populate) to get video details
//     {
//       $lookup: {
//         from: "videos", // The collection name
//         localField: "video",
//         foreignField: "_id",
//         as: "videoData",
//       },
//     },

//     // Unwind to flatten the array created by $lookup
//     { $unwind: "$videoData" },

//     // Filter only published videos
//     { $match: { "videoData.isPublished": true } },

//     // Project (select) only required fields
//     {
//       $project: {
//         _id: 0, // Exclude the _id of the Like document
//         video: {
//           _id: "$videoData._id",
//           thumbnail: "$videoData.thumbnail",
//           title: "$videoData.title",
//           description: "$videoData.description",
//           duration: "$videoData.duration",
//           views: "$videoData.views",
//         },
//       },
//     },

//     // Pagination
//     { $skip: skip },
//     { $limit: Number(limit) },
//   ]);

//   // Get total count of liked videos
//   const totalLikedVideos = await Like.countDocuments({
//     likedBy: req.user?._id,
//   });

//   const totalPages = Math.ceil(totalLikedVideos / limit);
//   const pagination = {
//     totalPages,
//     currentPage: Number(page),
//     hasNextPage: page < totalPages,
//     hasPreviousPage: page > 1,
//     totalLikedVideos,
//   };

//   return res.status(200).json(
//     new ApiResponse(200, { videos: results.map((v) => v.video), pagination }, "Liked videos fetched successfully")
//   );
// });

const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  if (page < 1) {
    throw new ApiError(400, "Invalid page number");
  }

  const skip = (page - 1) * limit;

  const results = await Like.aggregate([
    { $match: { likedBy: req.user?._id } }, // Match likes by user

    {
      $lookup: {
        from: "videos", // Join with videos collection
        localField: "video",
        foreignField: "_id",
        as: "videoData",
      },
    },

    { $unwind: "$videoData" }, // Flatten the array

    { $match: { "videoData.isPublished": true } }, // Only published videos

    {
      $lookup: {
        from: "users", // Join with users collection to get owner details
        localField: "videoData.owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 1, // Always include _id
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$owner" },

    {
      $project: {
        _id: 0,
        video: {
          _id: "$videoData._id",
          thumbnail: "$videoData.thumbnail",
          title: "$videoData.title",
          description: "$videoData.description",
          duration: "$videoData.duration",
          views: "$videoData.views",
          owner: "$owner", // Includes only selected fields
        },
      },
    },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const totalLikedVideos = await Like.countDocuments({ likedBy: req.user?._id });
  const totalPages = Math.ceil(totalLikedVideos / limit);
  const pagination = {
    totalPages,
    currentPage: Number(page),
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    totalLikedVideos,
  };

  return res.status(200).json(
    new ApiResponse(200, { videos: results.map((v) => v.video), pagination }, "Liked videos fetched successfully")
  );
});



export {getVideoLikesStatus,  getCommentLikesStatus, getTweetLikesStatus, toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
