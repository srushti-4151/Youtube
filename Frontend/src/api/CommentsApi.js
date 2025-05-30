import axios from "axios";
import { api } from "./AuthApi";

// const COMMENT_API_URL = "http://localhost:8000/api/v1/comments";
// const COMMENT_API_URL = "https://youtube-ydae.onrender.com/api/v1/comments";

const COMMENT_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1/comments"  // Local backend
    : "https://youtube-ydae.onrender.com/api/v1/comments";  // Deployed backend


// Add a Comment
export const addComment = async (videoId, commentData) => {
  try {
    console.log("Sending comment:", { videoId, commentData });
    const response = await api.post(`${COMMENT_API_URL}/${videoId}`, commentData);
    console.log("Add comment res", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add comment",
    };
  }
};

// Get Video Comments
export const getVideoComments = async (videoId) => {
  try {
    const response = await axios.get(`${COMMENT_API_URL}/${videoId}`);
    if (!response.data.success) {
      return { success: false, message: response.data.message };
    }
    console.log("gett comment res", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch comments",
    };
  }
};

// Update a Comment
export const updateComment = async (commentId, updatedData) => {
  try {
    const response = await api.patch(`${COMMENT_API_URL}/c/${commentId}`, updatedData);
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
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`${COMMENT_API_URL}/c/${commentId}`);
    console.log("delte comment res", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete comment",
    };
  }
};