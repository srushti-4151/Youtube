import { api } from "./AuthApi";

// const VIEWS_API_URL = "http://localhost:8000/api/v1/views";
// const VIEWS_API_URL = "https://youtube-ydae.onrender.com/api/v1/views";

const VIEWS_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1/views"  // Local backend
    : "https://youtube-ydae.onrender.com/api/v1/views";  // Deployed backend


export const countView = async (videoId) => {
  try {
    const response = await api.post(`${VIEWS_API_URL}/${videoId}`);
    console.log("res of views cot :", response)
    return response
  } catch (error) {
    console.error("Error counting view:", error.response?.data || error);
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


export const deleteHistoryItem = async (videoId) => {
  try {
    const response = await api.delete(`${VIEWS_API_URL}/history/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting watch history item:", error.response?.data || error);
  }
};

export const clearHistory = async () => {
  try {
    const response = await api.delete(`${VIEWS_API_URL}/history/clear`);
    return response.data;
  } catch (error) {
    console.error("Error clearing watch history:", error.response?.data || error);
  }
};

