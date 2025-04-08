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
      parentComment: null, // Only count main comments
    });

  const comments = await TweetComment.aggregate([
    { $match: { 
      tweet: new mongoose.Types.ObjectId(tweetId),
      parentComment: null
    } 
    }, 
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
      $lookup: {
        from: "tweetcomments",
        localField: "_id",
        foreignField: "parentComment",
        as: "replies",
        pipeline: [
          { $sort: { createdAt: 1 } }, // Sort replies (oldest first)
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                { $project: { username: 1, fullName: 1, avatar: 1 } },
              ],
            },
          },
          { 
            $addFields: { owner: { $arrayElemAt: ["$owner", 0] } } 
          },
          {
            $project: {
              content: 1,
              createdAt: 1,
              owner: 1,
            },
          },
        ],
      }
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
        replies: 1, 
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
  const { content, parentComment } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "tweet ID is required.");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  if (!content?.trim()) throw new ApiError(400, "Content is required");

  // Check if the parent comment exists if it's a reply
    if (parentComment) {
      if (!isValidObjectId(parentComment)) throw new ApiError(400, "Invalid Parent Comment ID");
      const parentExists = await TweetComment.findById(parentComment);
      if (!parentExists) throw new ApiError(404, "Parent comment not found");
    }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  const comment = await TweetComment.create({
    content,
    tweet: new mongoose.Types.ObjectId(tweetId),
    owner: req.user._id,
    parentComment: parentComment || null,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateTweetComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  
  const { tweetId } = req.params;
  const { content } = req.body;
  console.log("content",content)

  if (!tweetId) {
    throw new ApiError(400, "Comment Id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Comment Id");
  }

  const tcomment = await TweetComment.findById(tweetId);
  if (!tcomment) {
    throw new ApiError(404, "Comment not found");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  // console.log("req.user._id.toString()",req.user._id.toString())
  // console.log("tcomment.owner.toString()",tcomment.owner.toString())
  if (tcomment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not autorized to update this tcomment");
  }

  const updatedComment = await TweetComment.findByIdAndUpdate(
    tweetId,
    {
      $set: { content: content.trim() },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Tweet Comment updated successfully"));
});

const deleteTweetComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tcomment Id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tcomment Id");
  }

  const tcomment = await TweetComment.findById(tweetId);
  if (!tcomment) {
    throw new ApiError(404, "tcomment not found");
  }

  if (tcomment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tcomment");
  }

  if (tcomment.parentComment === null) {
      // If it's a main comment, delete all replies too
      await TweetComment.deleteMany({ parentComment: tweetId });
    }

  await TweetComment.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tcomment deleted successfully"));
});

export { getTweetComments, addTweetComment, updateTweetComment, deleteTweetComment};
