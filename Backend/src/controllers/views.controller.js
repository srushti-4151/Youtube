import mongoose from "mongoose";
import { VideoView } from "../models/videoView.model.js";
import crypto from "crypto";

// Function to generate a unique guestId
const generateGuestId = (ip = "", userAgent = "") => {
    const hash = crypto.createHash("sha256");
    hash.update(ip + userAgent);
    return hash.digest("hex");
  };
  

  // A. CHECK IF VIEW EXISTS:
  //  - For guest: Check by guest ID (hashed IP+user agent)
  //  - For user: Check by user ID

  // B. IF NEW VIEW:
  //   - Count the view (same as before)
  //   - IF user is logged-in → ALSO add/update their watch history

  // C. IF VIEW EXISTS:
  //   - For users → Still update watch history timestamp
  //   - For guests → Do nothing extra

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
      if (userId) {
        await VideoView.updateOne(
          { video: videoId, user: userId },
          { $set: { watchHistory: true, updatedAt: new Date() } }
        );
      }
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
    await VideoView.create({ 
      video: videoId, 
      user: userId, 
      guestId, 
      watchHistory: !!userId 
    });

    res.status(201).json({ message: "View counted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user's watch history
// export const getWatchHistory = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const history = await VideoView.find({ user: userId, watchHistory: true })
//       .populate("video", "title thumbnail") // Populate video details
//       .sort({ updatedAt: -1 });

//     res.status(200).json(history);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getWatchHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const history = await VideoView.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), watchHistory: true } },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      { $unwind: "$video" },
      {
        $project: {
          _id: 1,
          updatedAt: 1,
          "video._id": 1,
          "video.title": 1,
          "video.thumbnail": 1,
        },
      },
    ]);
    // console.log("Watch History Data:", history);
    
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWatchHistoryItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await VideoView.findOneAndDelete({ user: userId, video: videoId });

    if (!result) {
      return res.status(404).json({ message: "Watch history item not found" });
    }

    res.status(200).json({ message: "Watch history item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const clearWatchHistory1 = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     console.log("Clearing history for user:", userId); // Debugging log

//     await VideoView.deleteMany({ user: userId, watchHistory: true });

//     res.status(200).json({ message: "Watch history cleared successfully" });
//   } catch (error) {
//     console.error("Error clearing watch history:", error); // Log full error
//     res.status(500).json({ message: error.message });
//   }
// };


export const clearWatchHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Clearing history for user:", userId);

    await VideoView.deleteMany({ user: new mongoose.Types.ObjectId(userId) }); // ✅ Remove `watchHistory: true`

    res.status(200).json({ message: "Watch history cleared successfully" });
  } catch (error) {
    console.error("Error clearing watch history:", error);
    res.status(500).json({ message: error.message });
  }
};


