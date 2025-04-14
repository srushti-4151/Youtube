import axios from "axios";
import { api } from "./AuthApi";

// const TC_API_URL = "http://localhost:8000/api/v1/tweetcomment";
// const TC_API_URL = "https://youtube-ydae.onrender.com/api/v1/tweetcomment";

const TC_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1/tweetcomment"  // Local backend
    : "https://youtube-ydae.onrender.com/api/v1/tweetcomment";  // Deployed backend



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


// Update a Comment
export const updateTweetComment = async (tweetId, updatedData) => {
  try {
    console.log("tweetId comment updatedData", tweetId,updatedData)
    const response = await api.patch(`${TC_API_URL}/ct/${tweetId}`, updatedData);
    console.log("update comment res", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update comment",
    };
  }
};

// Delete a Comment
export const deleteTweetComment = async (tweetId) => {
  try {
    const response = await api.delete(`${TC_API_URL}/ct/${tweetId}`);
    console.log("delte comment res", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete comment",
    };
  }
};