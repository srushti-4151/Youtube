import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/Cloudinary.js";
import { VideoView } from "../models/videoView.model.js";

//videos uploaded by a specific user (uploaded by that user)
const getAllVideosById = asyncHandler(async (req, res) => {
  //🚀 Steps:
  //1️⃣ Extract query parameters** (`page`, `limit`, `query`, `sortBy`, `sortType`, `userId`).
  //2️⃣ Validate pagination** (`page`, `limit`).
  //3️⃣ Create `queryObject`** → Used to filter videos:
  //    - 🔍 If `userId` is provided, filter videos uploaded by that user.
  //    - 🏷️ If `query` (search term) is provided, filter videos by `title`/`description`.
  //4️⃣ Validate and create `sortObject` → Used to sort videos.
  //5️⃣ Count total videos matching the query.
  //6️⃣ Fetch videos using MongoDB aggregation:
  //    - 🎯 Filter videos using `queryObject`.
  //    - 🔗 Join with the `users` collection to get owner details.
  //    - 🔄 Apply sorting using `sortObject`.
  //    - 📌 Apply pagination using `$skip` and `$limit`.
  //7️⃣ Calculate total pages.
  //8️⃣ Return the videos + pagination info in the response.

  const {
    page = 1,
    limit = 50,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  //   console.log("req.query.userId",req.query.userId)
  console.log("Received userId:", req.query.userId);

  // Validate pagination params
  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  // Build query object
  const queryObject = {};

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    queryObject.owner = new mongoose.Types.ObjectId(userId); //Filtering by userId
  }

  // Only add search criteria if query is provided
  if (query) {
    queryObject.$or = [
      //$regex: query → This applies a pattern match (like LIKE in SQL)
      { title: { $regex: query, $options: "i" } }, //$options: "i" → This makes the search case-insensitive
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Validate and build sort object
  const allowedSortFields = [
    "title",
    "description",
    "createdAt",
    "updatedAt",
    "views",
  ];
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  if (!["asc", "desc"].includes(sortType)) {
    throw new ApiError(400, "Sort type must be 'asc' or 'desc'");
  }

  const sortObject = {
    [sortBy]: sortType === "desc" ? -1 : 1,
  };

  try {
    //Divides total videos by limit to calculate the total pages.
    const totalVideos = await Video.countDocuments(queryObject);

    // Get paginated videos with owner details
    const videos = await Video.aggregate([
      { $match: queryObject },
      // Join with views collection to count total views per video
      {
        $lookup: {
          from: "videoviews",
          localField: "_id",
          foreignField: "video",
          as: "views",
        },
      },
      {
        $addFields: {
          views: { $size: "$views" }, // Count total views
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
      { $unwind: "$owner" },
      { $sort: sortObject },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    const totalPages = Math.ceil(totalVideos / Number(limit));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalPages,
            totalVideos,
            hasNextPage: Number(page) < totalPages,
            hasPrevPage: Number(page) > 1,
          },
        },
        "Videos fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch videos");
  }
});

const getAllVideosOfUser = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  //   console.log("req.query.userId",req.query.userId)
  console.log("Received userId in of user:", req.query.userId);

  // Validate pagination params
  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  // Build query object
  const queryObject = {};

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    queryObject.owner = new mongoose.Types.ObjectId(userId); //Filtering by userId
  }

  // Only add search criteria if query is provided
  if (query) {
    queryObject.$or = [
      //$regex: query → This applies a pattern match (like LIKE in SQL)
      { title: { $regex: query, $options: "i" } }, //$options: "i" → This makes the search case-insensitive
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Validate and build sort object
  const allowedSortFields = [
    "title",
    "description",
    "createdAt",
    "updatedAt",
    "views",
  ];
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  if (!["asc", "desc"].includes(sortType)) {
    throw new ApiError(400, "Sort type must be 'asc' or 'desc'");
  }

  const sortObject = {
    [sortBy]: sortType === "desc" ? -1 : 1,
  };

  try {
    //Divides total videos by limit to calculate the total pages.
    const totalVideos = await Video.countDocuments(queryObject);

    // Get paginated videos with owner details
    const videos = await Video.aggregate([
      { $match: queryObject },
      // Join with views collection to count total views per video
      {
        $lookup: {
          from: "videoviews",
          localField: "_id",
          foreignField: "video",
          as: "views",
        },
      },
      {
        $addFields: {
          views: { $size: "$views" }, // Count total views
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
      { $unwind: "$owner" },
      { $sort: sortObject },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    const totalPages = Math.ceil(totalVideos / Number(limit));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalPages,
            totalVideos,
            hasNextPage: Number(page) < totalPages,
            hasPrevPage: Number(page) > 1,
          },
        },
        "Videos fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch videos");
  }
});

// fetches all videos  from the database with pagination, sorting, and owner details.
const getAllVideos = asyncHandler(async (req, res) => {
  //🚀Steps:
  //1️⃣ Extract query parameters (page, limit, sortBy, sortType).
  //2️⃣ Create a sortObject → Used to sort videos based on user input.
  //3️⃣ Count total videos → Used for pagination.
  //4️⃣ Fetch videos using MongoDB aggregation:
  // -🔗Join with the users collection to get owner details (username, fullName, avatar).
  // -🔄Apply sorting using sortObject.
  // -📌Apply pagination using $skip and $limit.
  //5️⃣ Calculate total pages.
  //6️⃣ Return the videos + pagination info in the response

  //TODO: get all videos based on query, sort, pagination
  // /api/videos?page=2 & limit=10 & sortBy=createdAt & sortType=desc
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortType = "desc",
    } = req.query;

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortType === "desc" ? -1 : 1; //"desc" (descending) → Newest first (-1). "asc" (ascending) → Oldest first (1).

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(); //Fetches the total number of videos in the database for pagination

    // Get paginated videos with owner details
    const videos = await Video.aggregate([
      {
        $lookup: {
          from: "users", // Target collection
          localField: "owner", // Field in "videos" collection
          foreignField: "_id", // Field in "users" collection
          as: "owner", // Output field
          pipeline: [
            {
              $project: {
                // Select only necessary fields
                username: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$owner" }, //ensures that each video has exactly one owner object.
      {
        $lookup: {
          from: "videoviews", // Count views from VideoView model
          localField: "_id",
          foreignField: "video",
          as: "views",
        },
      },
      // Add a view count field
      {
        $addFields: {
          views: { $size: "$views" },
        },
      },
      { $sort: sortObject },
      { $skip: (Number(page) - 1) * Number(limit) }, //Skip  videos (start from the beginning).
      { $limit: Number(limit) }, // makes sure we only fetch limit videos.
    ]);

    const totalPages = Math.ceil(totalVideos / limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalPages,
            totalVideos,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
        "Videos fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch videos");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;
  console.log("Video ID:", videoId);

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video id is required!!!!");
  }
  try {
    //The video document by its _id
    // The likes count for the video
    // Whether the current user liked the video
    // The owner details (username, full name, avatar)
    const video = await Video.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(videoId) }, //Find the Video by _id
      },
      {
        $lookup: {
          //Fetch Likes for the Video
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $lookup: {
          //Fetch the Video Owner Details
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      // Lookup views collection to count views
      {
        $lookup: {
          from: "videoviews", // The collection name for VideoView model
          localField: "_id",
          foreignField: "video",
          as: "views",
        },
      },
      {
        $addFields: {
          views: { $size: "$views" },
          // like count
          //likesCount: { $size: "$likes" },
          likesCount: {
            $size: {
              $filter: {
                input: "$likes",
                as: "like",
                cond: { $eq: ["$$like.type", "like"] }, // Only count likes
              },
            },
          },
          dislikesCount: {
            $size: {
              $filter: {
                input: "$likes",
                as: "like",
                cond: { $eq: ["$$like.type", "dislike"] }, // Only count dislikes
              },
            },
          },
          //Checking if the Current User Liked the Video
          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(req.user?._id),
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$likes",
                      as: "like",
                      cond: { $eq: ["$$like.type", "like"] }, // Filter only likes
                    },
                  },
                  as: "filteredLike",
                  in: "$$filteredLike.likedBy",
                },
              },
            ],
          },
          // Check if the current user disliked the video
          isDisliked: {
            $in: [
              new mongoose.Types.ObjectId(req.user?._id),
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$likes",
                      as: "like",
                      cond: { $eq: ["$$like.type", "dislike"] }, // Filter only dislikes
                    },
                  },
                  as: "filteredDislike",
                  in: "$$filteredDislike.likedBy",
                },
              },
            ],
          },
          //Transforming Owner Data
          owner: {
            $let: {
              vars: { ownerDoc: { $arrayElemAt: ["$owner", 0] } },
              in: {
                _id: "$$ownerDoc._id",
                username: "$$ownerDoc.username",
                fullName: "$$ownerDoc.fullName",
                avatar: "$$ownerDoc.avatar",
              },
            },
          },
        },
      },
      {
        $project: {
          // Remove Unnecessary Fields
          likes: 0,
          // views: 0, // Don't return full views array
        },
      },
    ]);
    if (!video?.length) {
      throw new ApiError(404, "Video not found!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video[0], "Video fetched successfully!"));
  } catch (err) {
    throw new ApiError(500, "Failed to fetch video!");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and Decsription are required.");
  }
  console.log("req.body:", req.body);

  console.log("req.files:", req.files);


  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required!");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required!");
  }

  

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  console.log("videoloacl",videoLocalPath)
  console.log("videoFile",videoFile)
  if (!videoFile) {
    throw new ApiError(500, "Failed to upload video file");
  }

  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailFile) {
    throw new ApiError(500, "Failed to upload thumbnail file"); // Fixed error message
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnailFile.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(500, "Failed to publish video!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully!"));
});

// const updateVideo = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;
//   const { title, description } = req.body;
//   const updateData = {};

//   //   console.log("req.params",req.params);
//   //   console.log("req.body",req.body);

//   // Validate videoId
//   if (!isValidObjectId(videoId)) {
//     throw new ApiError(400, "Invalid video ID");
//   }

//   // Validate and update title
//   if (title) {
//     if (title.length > 120) {
//       throw new ApiError(400, "Title exceeds 120 characters");
//     }
//     updateData.title = title;
//   }

//   // Validate and update description
//   if (description) {
//     if (description.length > 2000) {
//       throw new ApiError(400, "Description exceeds 2000 characters");
//     }
//     updateData.description = description;
//   }

//   // Handle thumbnail update
//   if (req.file) {
//     try {
//       // Validate file format
//       //   if (!["image/jpeg", "image/png"].includes(req.file.mimetype)) {
//       //     throw new ApiError(400, "Invalid thumbnail format (JPEG/PNG only)");
//       //   }

//       // Validate file size (max 2MB)
//       if (req.file.size > 2_097_152) {
//         throw new ApiError(400, "Thumbnail exceeds 2MB size limit");
//       }

//       // Fetch the existing video
//       const existingVideo = await Video.findById(videoId);
//       if (!existingVideo) {
//         throw new ApiError(404, "Video not found");
//       }

//       // Delete old thumbnail from Cloudinary if it exists
//       if (existingVideo.thumbnail) {
//         await deleteFromCloudinary(existingVideo.thumbnail);
//         console.log("Old thumbnail deleted from Cloudinary");
//       }

//       // Upload new thumbnail
//       const uploadResult = await uploadOnCloudinary(req.file.path);
//       if (!uploadResult?.url) {
//         throw new ApiError(500, "Cloudinary upload failed");
//       }

//       // Store new thumbnail URL
//       updateData.thumbnail = uploadResult.url;
//     } catch (uploadError) {
//       throw uploadError;
//     }
//   }

//   // Ensure at least one field is being updated
//   if (Object.keys(updateData).length === 0) {
//     throw new ApiError(400, "No valid update fields provided");
//   }

//   // Update the video document in MongoDB
//   const videoAfterUpdate = await Video.findByIdAndUpdate(
//     videoId,
//     { $set: updateData },
//     {
//       new: true, //Returns the updated document instead of the old one.
//       projection: { __v: 0, internalState: 0 }, // __v :0 Removes Mongoose version key (used for version tracking).
//       //internalState: 0 → Removes a custom field if it exists in your schema.
//     }
//   );

//   // If no video was found
//   if (!videoAfterUpdate) {
//     throw new ApiError(404, "Video not found or update failed");
//   }

//   // Return the updated video
//   return res
//     .status(200)
//     .json(new ApiResponse(200, videoAfterUpdate, "Video updated successfully"));
// });

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const updateData = {};
  console.log("req.params",req.params);
  console.log("req.body",req.body);

  // 1. Validate videoId first
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // 2. Fetch existing video ONCE at start
  const existingVideo = await Video.findById(videoId).select('-__v -internalState');
  if (!existingVideo) {
    throw new ApiError(404, "Video not found");
  }

  // 3. Smart Field Updates (only if changed)
  if (title !== undefined && title !== existingVideo.title) {
    if (title.length > 120) {
      throw new ApiError(400, "Title exceeds 120 characters");
    }
    updateData.title = title;
  }

  if (description !== undefined && description !== existingVideo.description) {
    if (description.length > 2000) {
      throw new ApiError(400, "Description exceeds 2000 characters");
    }
    updateData.description = description;
  }

  // 4. Thumbnail Handling (with transaction safety)
  if (req.file) {
    try {
      // Validate file
      if (req.file.size > 2_097_152) {
        throw new ApiError(400, "Thumbnail exceeds 2MB size limit");
      }

      // Upload new thumbnail first (fail fast)
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (!uploadResult?.url) {
        throw new ApiError(500, "Cloudinary upload failed");
      }

      // Only delete old thumbnail AFTER successful upload
      if (existingVideo.thumbnail) {
        await deleteFromCloudinary(existingVideo.thumbnail);
      }

      updateData.thumbnail = uploadResult.url;
    } catch (error) {
      // Clean up failed upload
      if (req.file.path) fs.unlinkSync(req.file.path);
      throw error;
    }
  }

  // 5. Final Update Decision
  if (Object.keys(updateData).length === 0) {
    return res.status(200)
      .json(new ApiResponse(200, existingVideo, "No changes detected"));
  }

  const videoAfterUpdate = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    { new: true, projection: { __v: 0, internalState: 0 } }
  );

  return res.status(200)
    .json(new ApiResponse(200, videoAfterUpdate, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Inavalid Video Id");
  }
  try {
    if (!videoId) {
      throw new ApiError(400, "Video Id is Required");
    }

    const response = await Video.findByIdAndDelete(videoId);

    if (!response) {
      throw new ApiError(500, "Failed  To delete");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video deleted Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to delete video, try again"
    );
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const toggledVideoStatus = await Video.findByIdAndUpdate(
    videoId,
    [
      {
        $set: {
          isPublished: {
            $not: "$isPublished",
          },
        },
      },
    ],
    { new: true }
  );

  if (!toggledVideoStatus) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        toggledVideoStatus,
        "Video Status Changed Sucessfully"
      )
    );
});

export {
  getAllVideosById,
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideosOfUser
};
