import mongoose from "mongoose";
import {WatchLater} from "../models/watchLater.model.js";

// ✅ Add Video to Watch Later
export const addToWatchLater = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const exists = await WatchLater.findOne({ user: userId, video: videoId });
    if (exists)
      return res.status(400).json({ message: "Already in Watch Later" });

    const newEntry = new WatchLater({ user: userId, video: videoId });
    await newEntry.save();

    res.status(201).json({ message: "Added to Watch Later" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Remove Video from Watch Later
export const removeFromWatchLater = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await WatchLater.findOneAndDelete({ user: userId, video: videoId });

    res.status(200).json({ message: "Removed from Watch Later" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Watch Later Videos
export const getWatchLater = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const watchLaterVideos = await WatchLater.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } }, // Filter by user
      {
        $lookup: {
          from: "videos", // Name of the videos collection
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      { $unwind: "$video" }, // Convert array to object
      {
        $project: {
          _id: 1,
          addedAt: 1,
          "video._id": 1,
          "video.title": 1,
          "video.thumbnail": 1,
          "video.duration": 1,
        },
      },
      { $sort: { addedAt: -1 } }, // Sort by latest added
    ]);

    res.status(200).json(watchLaterVideos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
