import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js";

const getAllTweets = asyncHandler(async (req, res) => {
  try {
    const tweets = await Tweet.aggregate([
      // Join with Users collection to get owner details
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

      // Join with Likes collection to get likes count
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "tweet",
          as: "likes",
        },
      },

      // Join with TweetComments collection to get comments count
      {
        $lookup: {
          from: "tweetcomments",
          localField: "_id",
          foreignField: "tweet",
          as: "comments",
        },
      },

      // Add computed fields for like count, comments count, and owner details
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          owner: { $arrayElemAt: ["$owner", 0] },
        },
      },

      // Project the final fields to return
      {
        $project: {
          _id: 1,
          content: 1,
          post: 1,
          owner: 1,
          createdAt: 1,
          likesCount: 1,
          commentsCount: 1,
        },
      },
    ]);

    if (!tweets) {
      throw new ApiError(500, "Tweets could not be fetched");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching tweets");
  }
});

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const owner = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(owner)) {
    throw new ApiError(400, "Invalid User ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  // Check if image exists before trying to upload
  let postImageUrl = "";
  if (req.file) {
    const postImagePath = req.file.path;
    const uploadedImage = await uploadOnCloudinary(postImagePath);

    if (!uploadedImage?.url) {
      throw new ApiError(400, "Error while uploading the image");
    }

    postImageUrl = uploadedImage.url;
  }

  // Create Tweet in DB
  const newTweet = await Tweet.create({
    content,
    owner,
    post: postImageUrl,  // Store image URL if exists, otherwise ""
  });

  if (!newTweet) {
    throw new ApiError(500, "Tweet could not be created");
  }

   // Fetch newly created tweet with aggregation pipeline
   const tweet = await Tweet.aggregate([
    { $match: { _id: newTweet._id } },

    // Join with Likes collection
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },

    // Join with Users collection to get owner details
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

    // Add computed fields for like count and whether the current user liked it
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: { $arrayElemAt: ["$owner", 0] },
        isLiked: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$likes",
                      as: "like",
                      cond: {
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
        _id: 1,
        content: 1,
        post: 1,
        owner: 1,
        createdAt: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!tweet || tweet.length === 0) {
    throw new ApiError(500, "Error fetching created tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet[0], "Tweet created successfully!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("user iid for tweet: ", userId);

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

      // Add computed fields for likesCount and isLiked by the current user
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          owner: { $arrayElemAt: ["$owner", 0] },
          // isLiked: {
          //   $in: [new mongoose.Types.ObjectId(req.user?._id), "$likes.likedBy"],
          //   // Check if the current user is in the likedBy array
          // },
          isLiked: {
            //Boolean indicating whether the current user liked this comment.
            $cond: {
              if: {
                $gt: [
                  // Check if the filtered likes count is greater than 0
                  {
                    $size: {
                      //$size is used because the likes field is an array (not separate documents).
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
          _id: 1,
          content: 1,
          post: 1,
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

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check if the logged-in user is the owner of the tweet
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this tweet");
  }

  // **Only allow updating the content**
  tweet.content = content || tweet.content;
  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet content updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check if the logged-in user is the owner of the tweet
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this tweet");
  }

  // Delete image from Cloudinary if exists
  if (tweet.post) {
    await deleteFromCloudinary(tweet.post);
  }

  // Delete tweet from database
  await tweet.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

const getTweetById = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  console.log("Received tweetId:", tweetId);


  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const tweet = await Tweet.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(tweetId) } },

    // Join with Users collection to get owner details
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

    // Add computed fields for like count and whether the current user liked it
    {
      $addFields: {
        owner: { $arrayElemAt: ["$owner", 0] },
      },
    },

    // Join with TweetComments collection to get comments count
    {
      $lookup: {
        from: "tweetcomments",
        localField: "_id",
        foreignField: "tweet",
        as: "comments",
      },
    },

    // Add commentsCount field
    {
      $addFields: {
        commentsCount: { $size: "$comments" },
      },
    },

    {
      $project: {
        _id: 1,
        content: 1,
        post: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
        commentsCount: 1,
      },
    },
  ]);

  if (!tweet || tweet.length === 0) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet[0], "Tweet fetched successfully"));
});


export { getAllTweets, createTweet, getUserTweets, updateTweet, deleteTweet, getTweetById };
