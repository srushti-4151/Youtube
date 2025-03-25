import axios from "axios";
import { api } from "./AuthApi";

const SUBS_API_URL = "http://localhost:8000/api/v1/subscriptions";


// Get User Subscribers Count
export const checkSubscriptionStatus = async (username) => {
  try {
    const response = await api.get(`${SUBS_API_URL}/status/${username}`);
    console.log("checkSubscriptionStatus response", response);
    return response.data;
  } catch (error) {
    console.error("Get checkSubscriptionStatus Error:", error.response?.data || error);
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

// Toggle Subscription
export const toggleSubscription = async (channelId) => {
  try {
    const response = await api.post(`${SUBS_API_URL}/c/${channelId}`);
    console.log("Toggle response", response);
    return response.data;
  } catch (error) {
    console.error("Subscription Error:", error.response?.data || error);
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

// Get User Subscribers Count
export const getUserSubscribers = async (channelId) => {
  try {
    const response = await api.get(`${SUBS_API_URL}/c/${channelId}`);
    // console.log("getUserSubscribers response", response);
    return response.data;
  } catch (error) {
    console.error("Get Subscribers Error:", error.response?.data || error);
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

// Get Subscribed Channels for a User
export const getSubscribedChannels = async (subscriberId) => {
  try {
    const response = await api.get(`${SUBS_API_URL}/u/${subscriberId}`);
    console.log("getSubscribedChannels response", response);
    return response.data;
  } catch (error) {
    console.error(
      "Get Subscribed Channels Error:",
      error.response?.data || error
    );
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};
