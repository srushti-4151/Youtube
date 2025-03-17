import axios from "axios";
import { refreshAuthToken } from "../redux/slices/Authslice.js"; // Import action

const API_URL = "http://localhost:8000/api/v1/users";

// You call getCurrentUser().
// Your token is expired → API fails with 401 Unauthorized.
// Interceptor catches the error.
// Calls refreshAuthToken() to get a new token.
// Saves the new token and retries the request.
// You get the correct response instead of an error.

// Create an Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Ensure cookies are sent
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If refresh token request itself fails, log out user
    if (originalRequest.url.includes("/refresh-token")) {
      console.log("Refresh token failed, logging out...");
      return Promise.reject(error);
    }

    // If token expired and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Token expired, refreshing token...");
        const success = await refreshToken(); // Call refresh function

        if (success) {
          console.log("Token refreshed, retrying original request...");
          return api(originalRequest); // Retry failed request
        }

        console.log("Token refresh failed, rejecting request...");
        return Promise.reject(error);
      } catch (refreshError) {
        console.log("Token refresh error:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// Get Current User
export const getCurrentUser = async () => {
  try {
    // const response = await axios.get(`${API_URL}/current-user`, {
    //   withCredentials: true,
    // });
    const response = await api.get(`/current-user`);
    console.log("Api getCurrentuser resposne", response.data);
    return response.data;
  } catch (error) {
    return null; // No user logged in
  }
};

//refresh token API
// export const refreshToken = async () => {
//   try {
//     // const response = await axios.get(`${API_URL}/refresh-token`, {
//     //   withCredentials: true, // Ensure cookies are sent
//     // });
//     const response = await api.get(`/refresh-token`);

//     return response.data.accessToken; // Should return new access token
//   } catch (error) {
//     return null; // Token refresh failed
//   }
// };

// Refresh Token Function
export const refreshToken = async () => {
  try {
    const res = await api.post("/refresh-token");
    const newAccessToken = res.data.data.accessToken;

    // Update the Authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    return newAccessToken;
  } catch (error) {
    console.error("Refresh token request failed:", error);
    return false;
  }
};

// Login API
export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData, {
      withCredentials: true, // Ensures cookies (JWT) are handled properly
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

// Register API
export const register = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, formData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

// Logout API
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};
