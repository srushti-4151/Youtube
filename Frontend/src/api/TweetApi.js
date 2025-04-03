import axios from "axios";
import { api } from "./AuthApi";

const TWEET_API_URL = "http://localhost:8000/api/v1/tweets";

// Create a new tweet (supports image uploads)
export const createTweet = async (formData) => {
  try {
    const response = await api.post(TWEET_API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Create Tweet reonse :", response)
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
    console.log("getUserTweets reonse :", response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get Tweets",
    };
  }
};
