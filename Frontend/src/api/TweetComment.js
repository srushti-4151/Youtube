import axios from "axios";
import { api } from "./AuthApi";

const TC_API_URL = "http://localhost:8000/api/v1/tweetcomment";

// Add a Comment
export const addTweetComment = async (tweetId, commentData) => {
  try {
    console.log("Sending comment:", { tweetId, commentData });
    const response = await api.post(`${TC_API_URL}/ct/${tweetId}`, commentData);
    console.log("TC Add comment res", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add comment",
    };
  }
};

// Get Video Comments
export const getTweetComments = async (tweetId) => {
  try {
    const response = await axios.get(`${TC_API_URL}/ct/${tweetId}`);
    console.log("TC gett comment res", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch comments",
    };
  }
};
