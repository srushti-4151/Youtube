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
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, //ensure cookies are sent 
})
//Catch API Errors (Interceptor)
api.interceptors.response.use(
  (response) => response,//// If success, return response
  async (error) => {
    const originalRequest = error.config; // Save the failed request
    // If the API fails with 401 Unauthorized, we check if the token is expired.
    // If this is the first failure, we retry only once (_retry = true).
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request as retried

      try {
        // Dispatch refresh token action
        //Calls the Redux action refreshAuthToken() to get a new token.
         // ✅ Lazy import the store inside the function
         const { store } = await import("../redux/store/Store.js");
        
         // Dispatch refreshAuthToken
         const newToken = await store.dispatch(refreshAuthToken()).unwrap();

        // Update Axios headers with new token
        //Set the New Token & Retry the Request
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Retry failed request
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
)

//refresh token API
export const refreshToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/refresh-token`, {
      withCredentials: true, // Ensure cookies are sent
    });

    return response.data; // Should return new access token
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
