import { api } from "./AuthApi";

const VIEWS_API_URL = "http://localhost:8000/api/v1/views";

export const countView = async (videoId) => {
  try {
    const response = await api.post(`${VIEWS_API_URL}/${videoId}`);
    // console.log("res of views cot :", response)
    return response
  } catch (error) {
    console.error("Error counting view:", error.response?.data || error);
  }
};

// Add video to watch history
export const addToWatchHistory = async (videoId) => {
  try {
    console.log("Add History videoId.......:", videoId)
    const response = await api.post(`${VIEWS_API_URL}/history/${videoId}`);
    console.log("History response.......:", response)
    return response.data;
  } catch (error) {
    console.error("Error adding to watch history:", error.response?.data || error);
  }
};

// Get watch history (Paginated)
export const getWatchHistory = async () => {
  try {
    const response = await api.get(`${VIEWS_API_URL}/history`);
    console.log("res for get watchHistry", response )
    return response.data;
  } catch (error) {
    console.error("Error fetching watch history:", error.response?.data || error);
  }
};
