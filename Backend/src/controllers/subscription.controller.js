import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (!channelId) {
    throw new ApiError(400, "channel ID is required");
  }

  try {
    const existingSubscription = await Subscription.findOne({
      subscriber: req?.user._id,
      channel: channelId,
    });

    if (existingSubscription) {
      await Subscription.deleteOne({ _id: existingSubscription._id });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Channel Unsubscribed Successfully.."));
    } else {
      await Subscription.create({
        channel: channelId,
        subscriber: req?.user._id,
      });
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Channel Subscribed Successfully.."));
    }
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Faild to subscribe , try again."
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (!channelId) {
    throw new ApiError(400, "Channel ID required");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriptionDetails",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: { subscriptionDetails: { $first: "$subscriptionDetails" } }, 
    },
    {
      $facet: {
        subscriberList: [{ $project: { subscriptionDetails: 1 } }],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $project: {
        subscribers: "$subscriberList",
        totalSubscribers: { $ifNull: [{ $first: "$totalCount.count" }, 0] },
      },
    },
  ]);

  if (!subscribers.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscribers found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params; // Rename channelId to subscriberId

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber Id");
  }

  if (!subscriberId) {
    throw new ApiError(400, "Subscriber Id is required");
  }

  try {
    const subscribedChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId), // Correct field
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channelDetails",
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "channel",
          foreignField: "channel",
          as: "subscriberCount",
          pipeline: [
            {
              $count: "count",
            },
          ],
        },
      },
      {
        $addFields: {
          channelDetails: { $first: "$channelDetails" },
          subscriberCount: { $first: "$subscriberCount.count" },
        },
      },
      {
        $facet: {
          channels: [
            {
              $project: {
                channelDetails: 1,
                subscriberCount: { $ifNull: ["$subscriberCount", 0] },
              },
            },
          ],
          totalCount: [
            {
              $count: "count", //$count is used to count how many times this channel appears in the subscriptions collection.
            },
          ],
        },
      },
      {
        $project: {
          subscribedChannels: "$channels",
          totalSubscribedChannels: {
            $first: "$totalCount.count",
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedChannels,
          "Subscribed Channels Fetched Successfully."
        )
      );
  } catch (error) {
    throw new ApiError(500, error?.message || "Failed to Get Channels");
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
