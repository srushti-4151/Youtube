import axios from "axios";
import { api } from "./AuthApi";

const RECM_BASE_URL = import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1/recommendation"  // Local backend
    : "https://youtube-ydae.onrender.com/api/v1/recommendation";  // Deployed backend

// Fetch user interaction data
export const getUserInteractions = async () => {
    try {
        const response = await api.get(`${RECM_BASE_URL}/user-data`);
        console.log("")
        return response.data;
    } catch (error) {
        console.error("Error fetching interactions", error);
        return [];
    }
};

// Store user interaction (when user watches, likes, or subscribes)
export const addUserInteraction = async (userId, videoId, watched = false, liked = false, subscribed = false) => {
    try {
        const response = await api.post(`${RECM_BASE_URL}/add`, { userId, videoId, watched, liked, subscribed });
        console.log("addUserInteraction",addUserInteraction)
    } catch (error) {
        console.error("Error saving interaction", error);
    }
};
