import { api } from "./AuthApi.js"; // Use your existing API setup
import axios from "axios";

const Like_API_URL = "http://localhost:8000/api/v1/likes";

export const getLikedVideos = async () => {
  try {
    const response = await api.get(`${Like_API_URL}/videos`);
    return response.data;
  } catch (error) {
    console.error("Error getLikedVideos:", error);
    throw error;
  }
};

export const toggleVideoLike = async (videoId, type) => {
  try {
    const response = await api.post(`${Like_API_URL}/toggle/v/${videoId}`, {
      type,
    });
    return response.data;
  } catch (error) {
    console.error("Error toggling like/dislike:", error);
    throw error;
  }
};

export const getVideoLikesStatus = async (videoId) => {
  try {
    const response = await api.get(`${Like_API_URL}/status/v/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error getVideoLikesStatus like/dislike:", error);
    throw error;
  }
};

// Toggle Like/Dislike for Comment
export const toggleCommentLike = async (commentId, type) => {
  try {
    const response = await api.post(`${Like_API_URL}/toggle/c/${commentId}`, {
      type,
    });
    return response.data;
  } catch (error) {
    console.error("Error toggling comment like/dislike:", error);
    throw error;
  }
};

// Get Like Status for Comment
export const getCommentLikesStatus = async (commentId) => {
  try {
    const response = await api.get(`${Like_API_URL}/status/c/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting comment like/dislike status:", error);
    throw error;
  }
};


export const getTweetLikesStatus = async (tweetId) => {
  try {
    const response = await api.get(`${Like_API_URL}/status/t/${tweetId}`);
    console.log("tweet getTweetLikesStatus response:", response);
    return response.data;
  } catch (error) {
    console.error("Error getTweetLikesStatus like/dislike:", error);
    throw error;
  }
};

// Toggle Like/Dislike for Comment
export const toggleTweetLike = async (tweetId, type) => {
  try {
    const response = await api.post(`${Like_API_URL}/toggle/t/${tweetId}`, {
      type,
    });
    console.log("toggleTweetLike res", response)
    return response.data;
  } catch (error) {
    console.error("Error toggling comment like/dislike:", error);
    throw error;
  }
};


//TWEET COMMENT GET 

export const getTweetCommentLikesStatus = async (tweetComId) => {
  try {
    const response = await api.get(`${Like_API_URL}/status/t/c/${tweetComId}`);
    console.log("tweetComId like status", response)
    return response.data;
  } catch (error) {
    console.error("Error getting comment like/dislike status:", error);
    throw error;
  }
};
// /TWEET COMMENT TOGGLE
export const toggleTweetCommentLike = async (tweetComId, type) => {
  try {
    const response = await api.post(`${Like_API_URL}/toggle/t/c/${tweetComId}`, {
      type,
    });
    console.log("toggleTweetCommentLike response", response)
    return response.data;
  } catch (error) {
    console.error("Error toggling tweet comment like/dislike:", error);
    throw error;
  }
};
