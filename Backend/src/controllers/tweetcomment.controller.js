import mongoose, { isValidObjectId, mongo } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { TweetComment } from "../models/tweetcomment.model.js";
import { Tweet } from "../models/tweet.model.js"

const getTweetComments = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Video not found");
  }

  const totalComments = await TweetComment.countDocuments({
    tweet: new mongoose.Types.ObjectId(tweetId),
  });

  const comments = await TweetComment.aggregate([
    { $match: { tweet: new mongoose.Types.ObjectId(tweetId) } }, 
    { $sort: { createdAt: -1 } },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
    //Retrieve Likes for Each TweetComment
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    //Joins the users collection to get the comment owner's details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" }, // Total number of likes on the comment.
        owner: { $arrayElemAt: ["$owner", 0] }, // User details (comment owner).
        isLiked: {
          //Boolean indicating whether the current user liked this comment.
          $cond: {
            if: {
              $gt: [
                // Check if the filtered likes count is greater than 0
                {
                  $size: { //$size is used because the likes field is an array (not separate documents).
                    // Counts the number of likes where likedBy matches the current user.
                    $filter: {
                      // keeps only likes where likedBy equals the logged-in user’s _id.
                      input: "$likes",
                      as: "like",
                      cond: {
                        //Keep only the likes where like.likedBy === req.user?._id.
                        $eq: [
                          "$$like.likedBy",
                          new mongoose.Types.ObjectId(req.user?._id),
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        tweet: 1,
        owner: 1,
        createdAt: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);
  const totalPages = Math.ceil(totalComments / parseInt(limit)); // Fixed: Parse limit to integer
  const hasNextPage = parseInt(page) < totalPages; // Fixed: Parse page to integer
  const hasPrevPage = parseInt(page) > 1; // Fixed: Parse page to integer

  return res.status(200).json(
    new ApiResponse(200, {
      comments,
      totalComments,
      pagination: {
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    })
  );
});

const addTweetComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "tweet ID is required.");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await TweetComment.create({
    content,
    tweet: new mongoose.Types.ObjectId(tweetId),
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

// const updateComment = asyncHandler(async (req, res) => {
//   // TODO: update a comment
//   const { commentId } = req.params;
//   const { content } = req.body;

//   if (!commentId) {
//     throw new ApiError(400, "Comment Id is required");
//   }

//   if (!isValidObjectId(commentId)) {
//     throw new ApiError(400, "Invalid Comment Id");
//   }

//   const comment = await Comment.findById(commentId);
//   if (!comment) {
//     throw new ApiError(404, "Comment not found");
//   }

//   if (!content?.trim()) {
//     throw new ApiError(400, "Content is required");
//   }

//   if (comment.owner.toString() !== req.user._id.toString()) {
//     throw new ApiError(403, "Ypu are not autorized to update this comment");
//   }

//   const updatedComment = await Comment.findByIdAndUpdate(
//     commentId,
//     {
//       $set: { content: content.trim() },
//     },
//     { new: true }
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
// });

// const deleteComment = asyncHandler(async (req, res) => {
//   // TODO: delete a comment
//   const { commentId } = req.params;

//   if (!commentId) {
//     throw new ApiError(400, "Comment Id is required");
//   }

//   if (!isValidObjectId(commentId)) {
//     throw new ApiError(400, "Invalid Comment Id");
//   }

//   const comment = await Comment.findById(commentId);
//   if (!comment) {
//     throw new ApiError(404, "Comment not found");
//   }

//   if (comment.owner.toString() !== req.user._id.toString()) {
//     throw new ApiError(403, "You are not authorized to delete this comment");
//   }

//   await Comment.findByIdAndDelete(commentId);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Comment deleted successfully"));
// });

export { getTweetComments, addTweetComment};
