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

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { store } = await import("../redux/store/Store.js");
        const newToken = await store.dispatch(refreshAuthToken()).unwrap();

        if (!newToken) {
          return Promise.reject(error);
        }

        // **Fix: Update Axios default headers**
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


//refresh token API
export const refreshToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/refresh-token`, {
      withCredentials: true, // Ensure cookies are sent
    });

    return response.data.accessToken; // Should return new access token
  } catch (error) {
    return null; // Token refresh failed
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

// Get Current User
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/current-user`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return null; // No user logged in
  }
};
