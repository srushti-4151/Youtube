import { api } from "./AuthApi";

const Wl_API_URL = "http://localhost:8000/api/v1/watchlater";

export const getWatchLaterVideos = async () => {
  try {
    const response = await api.get(`${Wl_API_URL}`);
    console.log("getWatchLaterVideos response :",response)
    return response.data;
  } catch (error) {
    console.error("Error getWatchLaterVideos:", error.response?.data || error);
  }
};

export const addToWatchLater = async (videoId) => {
  try {
    const response = await api.post(`${Wl_API_URL}/${videoId}`);
    console.log("addToWatchLater response :",response)
    return response.data;
  } catch (error) {
    console.error("Error addToWatchLater:", error.response?.data || error);
  }
};

export const removeFromWatchLater = async (videoId) => {
  try {
    const response = await api.delete(`${Wl_API_URL}/${videoId}`);
    console.log("removeFromWatchLater response :",response)
    return response.data;
  } catch (error) {
    console.error("Error removeFromWatchLater:", error.response?.data || error);
  }
};
