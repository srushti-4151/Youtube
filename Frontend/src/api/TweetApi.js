import axios from "axios";
import { api } from "./AuthApi";

// const TWEET_API_URL = "http://localhost:8000/api/v1/tweets";
// const TWEET_API_URL = "https://youtube-ydae.onrender.com/api/v1/tweets";

const TWEET_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1/tweets"  // Local backend
    : "https://youtube-ydae.onrender.com/api/v1/tweets";  // Deployed backend

export const getAllTweet = async () => {
  try {
    const response = await axios.get(`${TWEET_API_URL}/all`);
    // console.log("getAllTweet reonse :", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get Tweets",
    };
  }
}

// Create a new tweet (supports image uploads)
export const createTweet = async (formData) => {
  try {
    const response = await api.post(TWEET_API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // console.log("Create Tweet reonse :", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add Tweet",
    };
  }
};

// Get all tweets of a specific user
export const getUserTweets = async (userId) => {
  try {
    const response = await axios.get(`${TWEET_API_URL}/user/${userId}`);
    // console.log("getUserTweets reonse :", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get Tweets",
    };
  }
};

export const getTweetById = async (tweetId) => {
  try {
    const response = await axios.get(`${TWEET_API_URL}/tid/${tweetId}`);
    console.log("get tweetId Tweets reonse :", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get Tweets",
    };
  }
};
// Update a tweet (only content)
export const updateTweet = async (tweetId, content) => {
  try {
    const response = await api.patch(`${TWEET_API_URL}/${tweetId}`, { content }, {
      headers: { "Content-Type": "application/json" }, // Send JSON data
    });
    // console.log("updateTweet response:", response);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update Tweet",
    };
  }
};

// Delete a tweet (and its Cloudinary image if exists)
export const deleteTweet = async (tweetId) => {
  try {
    const response = await api.delete(`${TWEET_API_URL}/${tweetId}`);
    // console.log("deleteTweet reonse :", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete Tweet",
    };
  }
};