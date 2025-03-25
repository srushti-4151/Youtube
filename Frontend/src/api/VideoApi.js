import axios from "axios";
import { api } from "./AuthApi";

const VIDEO_API_URL = "http://localhost:8000/api/v1/videos";

// Fetch all videos
// export const getAllVideos = async () => {
//   try {
//     const response = await api.get(`${VIDEO_API_URL}/all`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching videos:", error);
//     throw error;
//   }
// };

// export const getVideoById = async (videoId) => {
//   try {
//     const response = await api.get(`${VIDEO_API_URL}/${videoId}`);
//     // console.log("response of 1 vid", response);
//     // console.log("response.data of 1 vid", response.data);
//     return response.data;
//   } catch (error) {
//     return {
//       success: false,
//       message: error.response?.data?.message || "An error occurred",
//     };
//   }
// };

// Fetch all videos (Public API, no verifyJWT needed)
export const getAllVideos = async () => {
  try {
    const response = await axios.get(`${VIDEO_API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

// Fetch a single video by ID (Public API, no verifyJWT needed)
export const getVideoById = async (videoId) => {
  try {
    const response = await axios.get(`${VIDEO_API_URL}/${videoId}`);
    console.log("response of 1 vid", response);
    console.log("response.data of 1 vid", response.data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

export const uploadNewVideo = async (formData) => {
  try {
    const response = await api.post(VIDEO_API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    console.error("API Upload Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllVideosById = async (userId) => {
  try {
    const response = await api.get(`${VIDEO_API_URL}?userId=${userId}`); // ✅ Use query param
    // console.log("response of vid", response);
    // console.log("response.data of vid", response.data);
    return response.data; // ✅ Return only `data`
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};
