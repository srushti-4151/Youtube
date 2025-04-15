import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { VideoView } from "../models/videoView.model.js";
import { Subscription } from "../models/subscription.models.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 4); // last 5 days

    // Views by day
    const views = await VideoView.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      { $unwind: "$video" },
      { $match: { "video.owner": new mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalViews = await VideoView.countDocuments({
      video: { $in: await getVideoIdsByOwner(ownerId) },
    });

    // Likes by day
    const likes = await Like.aggregate([
      {
        $match: {
          type: "like",
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      { $unwind: "$video" },
      { $match: { "video.owner": new mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalLikes = await Like.countDocuments({
      type: "like",
      video: { $in: await getVideoIdsByOwner(ownerId) },
    });

    // Subscribers by day
    const subs = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(ownerId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSubscribers = await Subscription.countDocuments({
      channel: ownerId,
    });

    const labels = getLastNDays(5);
    const viewsData = getDataByLabel(labels, views);
    const likesData = getDataByLabel(labels, likes);
    const subscribersData = getDataByLabel(labels, subs);

    res.json({
      totalViews,
      totalLikes,
      totalSubscribers,
      labels,
      viewsData,
      likesData,
      subscribersData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getVideoIdsByOwner = async (ownerId) => {
  const videos = await Video.find({ owner: ownerId }).select("_id");
  return videos.map((v) => v._id);
};

const getLastNDays = (n) => {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

const getDataByLabel = (labels, records) => {
  const map = {};
  records.forEach((item) => {
    map[item._id] = item.count;
  });
  return labels.map((label) => map[label] || 0);
};

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
});

export { getChannelStats, getChannelVideos };
