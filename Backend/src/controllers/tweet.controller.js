import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content required!");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Tweet could not be created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid User ID");
    }

    const tweets = await Tweet.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },

      // adds an array (likes) to each tweet, containing all likes associated with that tweet.
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "tweet",
          as: "likes",
        },
      },

      // Add computed fields for likesCount and isLiked by the current user
      {
        $addFields: {
          likesCount: { $size: "$likes" }, // Count the number of likes
          isLiked: {
            $in: [new mongoose.Types.ObjectId(req.user?._id), "$likes.likedBy"],
            // Check if the current user is in the likedBy array
          },
        },
      },

      // Select only required fields for the response
      {
        $project: {
          _id: 1,
          content: 1,
          owner: 1,
          createdAt: 1,
          likesCount: 1,
          isLiked: 1,
        },
      },
    ]);

    if (!tweets) {
      throw new ApiError(500, "Tweets could not be fetched");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully..!"));
  } catch (error) {
    throw new ApiError(500, "Error fetching tweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { content },
      { new: true }
    );

    if (!updatedTweet) {
      throw new ApiError(500, "Tweet could not be updated");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Tweet could not be updated");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  try {
    await Tweet.findByIdAndDelete(tweetId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Tweet could not be deleted");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
