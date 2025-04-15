import { api } from "./AuthApi";

const Dash_API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1/dashboard/creator/analytics" // Local backend
    : "https://youtube-ydae.onrender.com/api/v1/dashboard/creator/analytics"; // Deployed backend

export const fetchDashboardAnalytics = async () => {
  const response = await api.get(Dash_API_URL); // JWT is auto-included in headers
  return response.data;
};
