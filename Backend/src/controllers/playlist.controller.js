import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "Name and description are required!");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Check if a playlist with the same name exists for the user**
  const existingPlaylist = await Playlist.findOne({ 
    name: name.trim(), 
    owner: req.user._id 
  });

  if (existingPlaylist) {
    throw new ApiError(400, "A playlist with this name already exists!");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user._id,
    videos: [], //Initialize video array.
  });

  if (!playlist) {
    throw new ApiError(500, "failed t create playlist");
  }

  return res
    .status(201) // 201 for resource creation instead of 200
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId?.trim() || !isValidObjectId(userId)) {
    throw new ApiError(400, "invalid userId");
  }

  const playlists = await Playlist.find({
    owner: userId,
  }).populate("videos");

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => { 
  const { playlistId } = req.params;

  // Validate playlistId
  if (!playlistId?.trim() || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  // Fetch playlist with aggregation to populate videos and include views
  const playlist = await Playlist.aggregate([
    { 
      $match: { _id: new mongoose.Types.ObjectId(playlistId) } 
    },
    {
      $lookup: {
        from: "videos", // Reference to "videos" collection
        localField: "videos", // Field in Playlist to match with Video
        foreignField: "_id", // Field in Video collection to join with
        as: "videos" // Output field containing array of video data
      }
    },
    {
      $unwind: "$videos" // Ensure we have one video per document
    },
    {
      $lookup: {
        from: "videoviews", // Reference to "videoviews" collection for view counts
        localField: "videos._id", // Match video ID
        foreignField: "video", // Field in "videoviews" collection to join with
        as: "views" // Array to hold view counts
      }
    },
    {
      $addFields: {
        "videos.views": { $size: "$views" } // Count the number of views for each video
      }
    },
    {
      $group: {
        _id: "$_id", // Group by playlist ID
        name: { $first: "$name" },
        description: { $first: "$description" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        videos: { $push: "$videos" }, // Push the video data (with views) into an array
        owner: { $first: "$owner" },
      }
    }
  ]);

  // Check if playlist exists
  if (!playlist || playlist.length === 0 || !playlist[0]) {
    throw new ApiError(404, "Playlist not found");
  }

  // Check if the playlist has no videos left after removal
  if (playlist[0].videos.length === 0) {
    // Return the playlist with an empty videos array
    return res.status(200).json(new ApiResponse(200, { ...playlist[0], videos: [] }, "No videos left in the playlist"));
  }

  
  // Return the updated playlist with videos and views
  return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

// const getPlaylistById = asyncHandler(async (req, res) => { 
//   const { playlistId } = req.params;

//   // Validate playlistId
//   if (!playlistId?.trim() || !isValidObjectId(playlistId)) {
//     throw new ApiError(400, "Invalid playlistId");
//   }

//   // Fetch playlist with aggregation to populate videos and include views
//   const playlist = await Playlist.aggregate([
//     { 
//       $match: { _id: new mongoose.Types.ObjectId(playlistId) } 
//     },
//     {
//       $lookup: {
//         from: "videos", // Reference to "videos" collection
//         localField: "videos", // Field in Playlist to match with Video
//         foreignField: "_id", // Field in Video collection to join with
//         as: "videos" // Output field containing array of video data
//       }
//     },
//     // Only unwind if there are videos in the playlist
//     {
//       $addFields: {
//         videosCount: { $size: "$videos" }
//       }
//     },
//     {
//       $match: {
//         videosCount: { $gt: 0 } // Only proceed with videos if count is greater than 0
//       }
//     },
//     {
//       $unwind: "$videos" // Ensure we have one video per document
//     },
//     {
//       $lookup: {
//         from: "videoviews", // Reference to "videoviews" collection for view counts
//         localField: "videos._id", // Match video ID
//         foreignField: "video", // Field in "videoviews" collection to join with
//         as: "views" // Array to hold view counts
//       }
//     },
//     {
//       $addFields: {
//         "videos.views": { $size: "$views" } // Count the number of views for each video
//       }
//     },
//     {
//       $group: {
//         _id: "$_id", // Group by playlist ID
//         name: { $first: "$name" },
//         description: { $first: "$description" },
//         createdAt: { $first: "$createdAt" },
//         updatedAt: { $first: "$updatedAt" },
//         videos: { $push: "$videos" }, // Push the video data (with views) into an array
//         owner: { $first: "$owner" },
//       }
//     }
//   ]);

//   if (!playlist || playlist.length === 0) {
//     throw new ApiError(404, "Playlist not found");
//   }

//   // Check if the playlist has no videos left after removal
//   if (playlist[0].videos.length === 0) {
//     // Return the playlist with an empty videos array
//     return res.status(200).json(new ApiResponse(200, { ...playlist[0], videos: [] }, "No videos left in the playlist"));
//   }

//   // Return the updated playlist with videos and views
//   return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
// });

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId?.trim() || !videoId?.trim()) {
    throw new ApiError(400, "PlaylistId and VideoId are required!");
  }
  // Check if playlist exists and user owns it
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Unauthorized - You don't own this playlist");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if video is already in playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId?.trim() || !videoId?.trim()) {
    throw new ApiError(400, "PlaylistId and VideoId are required!");
  }
  // Check if playlist exists and user owns it
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Unauthorized - You don't own this playlist");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId?.trim() || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Unauthorized - You don't own this playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId?.trim() || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!name?.trim() && !description?.trim()) {
    throw new ApiError(
      400,
      "At least one field (name or description) is required for update"
    );
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Unauthorized - You don't own this playlist");
  }

  if (name?.trim()) playlist.name = name.trim();
  if (description?.trim()) playlist.description = description.trim();

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
