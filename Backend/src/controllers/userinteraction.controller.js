import UserInteraction from "../models/UserInteraction.js";
import { Video } from "../models/video.model.js";
import { generateTrainingData } from "../utils/generateTrainingData.js";
import * as tf from "@tensorflow/tfjs";
import mongoose, { isValidObjectId } from "mongoose";

// Fetch all user interactions
export const getUserInteractions = async (req, res) => {
  try {
    const data = await UserInteraction.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};

export const getTrainingDataHandler = async (req, res) => {
  const data = await generateTrainingData();
  res.json(data);
};

export const getRecommendedVideos = async (req, res) => {
  try {
    const currentUserId = req.user?._id;

    const trainingData = await UserInteraction.find();
    // ✅ 1. Collect current user’s interaction data
    const userInteractions = trainingData.filter(
      (d) => d.userId.toString() === currentUserId.toString()
    );
    const watchedVideoIds = userInteractions.map((i) => i.videoId.toString());

    // ✅ 2. Encode user & video IDs
    const encode = {};
    let index = 0;
    trainingData.forEach(({ userId, videoId }) => {
      if (!(userId in encode)) encode[userId] = index++;
      if (!(videoId in encode)) encode[videoId] = index++;
    });

    const xs = tf.tensor2d(
      trainingData.map((d) => [encode[d.userId], encode[d.videoId]])
    );
    // const ys = tf.tensor2d(trainingData.map((d) => [d.score]));
    const ys = tf.tensor2d(
      trainingData.map((d) => {
        let score = 0;
        if (d.watched) score += 1;
        if (d.liked) score += 2;
        if (d.subscribed) score += 3;
        return [score];
      })
    );

    const model = tf.sequential();
    model.add(
      tf.layers.dense({ inputShape: [2], units: 10, activation: "relu" })
    );
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: "adam", loss: "meanSquaredError" });

    await model.fit(xs, ys, { epochs: 50 });

    const allVideoIds = Object.keys(encode).filter(
      (id) => id !== currentUserId && id.length === 24
    );

    const predictions = [];
    for (let videoId of allVideoIds) {
      // if (!(currentUserId in encode)) {
      //   return res.status(404).json({ message: "User not found in training data" });
      // }
      const input = tf.tensor2d([[encode[currentUserId], encode[videoId]]]);
      const prediction = model.predict(input);
      const score = await prediction.data();
      predictions.push({
        videoId,
        score: score[0],
      });
    }
    // ✅ 3. Filter out videos the user already interacted with
    const unseenPredictions = predictions.filter(
      (p) => !watchedVideoIds.includes(p.videoId)
    );

    // ✅ 4. Sort and select top 10
    const topVideoIds = predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((v) => v.videoId);

    const recommendedVideos = await Video.aggregate([
      // {
      //   $match: {
      //     _id: {
      //       $in: topVideoIds.map((id) => new mongoose.Types.ObjectId(id)),
      //     },
      //   },
      // },
      { $match: { _id: { $in: topVideoIds.map(id => new mongoose.Types.ObjectId(id)) } } },
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
          views: { $size: "$views" },
        },
      },
    ]);
    res.json(recommendedVideos);
  } catch (error) {
    res.status(500).json({ message: "Recommendation failed", error });
  }
};

export const getVideoDetails = async (req, res) => {
  try {
    const { videoIds } = req.body;
    const videos = await Video.find({ _id: { $in: videoIds } });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching video details", err });
  }
};

// Store user interactions (when user watches, likes, or subscribes)
export const addUserInteraction = async (req, res) => {
  try {
    const { userId, videoId, watched, liked, subscribed } = req.body;

    // Check if entry exists
    let interaction = await UserInteraction.findOne({ userId, videoId });

    if (interaction) {
      // Update existing interaction
      interaction.watched = watched || interaction.watched;
      interaction.liked = liked || interaction.liked;
      interaction.subscribed = subscribed || interaction.subscribed;
      await interaction.save();
    } else {
      // Create a new entry
      interaction = new UserInteraction({
        userId,
        videoId,
        watched,
        liked,
        subscribed,
      });
      await interaction.save();
    }

    res.status(201).json({ message: "User interaction saved", interaction });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
};
