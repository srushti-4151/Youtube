import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { VideoView } from "../models/videoView.model.js";
import crypto from "crypto";

// Function to generate a unique guestId
const generateGuestId = (ip = "", userAgent = "") => {
    const hash = crypto.createHash("sha256");
    hash.update(ip + userAgent);
    return hash.digest("hex");
  };
  

export const countVideoView = async (req, res) => {
  try {
     // Get videoid from req params
     // check if user logged in - if yes, use UserId 
     //                         - if no, generate unique guestId
    const { videoId } = req.params;
    const userId = req.user ? req.user.id : null; // Get userId if authenticated
    let guestId = null;

     
    if (!userId) {
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];
      guestId = generateGuestId(ip, userAgent);
    }

    //Check if the user/Guest hs already viewed this video
    //stops the same user/guest from adding multiple views.
    const existingView = await VideoView.findOne({
      video: videoId,
      $or: [{ user: userId }, { guestId }],
    });

    if (existingView) {
      return res.status(200).json({ message: "View already counted" });
    }

    //Special Case: Prevent the same person from counting a guest view if they already watched while logged in
    //prevents a guest from "double counting" views if they logged in before.
    if (!userId) {
      const loggedInView = await VideoView.findOne({
        video: videoId,
        guestId, // Check if this guest has a logged-in view
        user: { $ne: null }, // User was logged in at the time
      });
    
      if (loggedInView) {
        return res.status(200).json({ message: "View already counted as a logged-in user" });
      }
    }

    // Save new view
    await VideoView.create({ video: videoId, user: userId, guestId });

    res.status(201).json({ message: "View counted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToWatchHistory = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Login required to track watch history" });
    }

    // Convert to ObjectId for proper comparison
    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find if user already watched this video
    const existingHistory = await VideoView.findOne({ video: videoObjectId, user: userObjectId });
    console.log("Existing History:", existingHistory);

    if (existingHistory) {
      // Update last watched time
      await VideoView.updateOne({ _id: existingHistory._id }, { lastWatchedAt: Date.now() });
    } else {
      // Create new history entry
      await VideoView.create({ video: videoObjectId, user: userObjectId, lastWatchedAt: Date.now() });
    }

    res.status(200).json({ message: "Watch history updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWatchHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Login required to fetch watch history" });
    }

    const page = Math.max(1, Number(req.query.page) || 1); // Ensure valid page number
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10)); // Limit max results to 50
    const skip = (page - 1) * limit;

    // Fetch history without populate (more optimized)
    const history = await VideoView.find({ user: userId })
      .sort({ lastWatchedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select("video lastWatchedAt") // Select only required fields
      .lean();

    // Fetch only required video details separately (better than populate)
    const videoIds = history.map((entry) => entry.video);
    const videos = await Video.find({ _id: { $in: videoIds } })
      .select("title thumbnail duration")
      .lean();

    // Map video details to history
    const historyWithVideos = history.map((entry) => ({
      ...entry,
      video: videos.find((v) => v._id.toString() === entry.video.toString()),
    }));

    res.status(200).json({ history: historyWithVideos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



