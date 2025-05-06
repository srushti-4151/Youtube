// Understanding authSlice.js (Redux Authentication)
// This file manages user authentication using Redux Toolkit. It does three main things:
// ✅ Handles API calls asynchronously using createAsyncThunk.
// ✅ Manages authentication state (user, isLoading, error).
// ✅ Updates Redux state when a user logs in, logs out, or registers.

// createAsyncThunk (What is it?)
// createAsyncThunk is a Redux Toolkit function that handles asynchronous operations (like API calls).
// it:
// Fetches data from an API.
// Manages success and failure responses.
// Automatically updates the Redux store.
// Think of it as a function that performs an API call and updates the state based on the result.

// How createAsyncThunk Works (Step-by-Step)
// Whenever an async action (like login) is triggered:
// 1️⃣ Pending: The request starts → isLoading = true.
// 2️⃣ Fulfilled: The request is successful → user state updates.
// 3️⃣ Rejected: The request fails → error state updates.

// createAsyncThunk handles API calls.
// extraReducers updates Redux state when an API call succeeds/fails.
// dispatch() triggers actions (login, logout, fetch user).

// Step-by-Step Flow (Login Process)
// 🔹 A user enters email & password and clicks Login.
// 🔹 The frontend calls dispatch(loginUser(userData)).
// 🔹 loginUser sends the data to the API (login(userData)).
// 🔹 If successful, user details are stored in Redux.
// 🔹 If failed, the error message is stored in Redux.

// What is builder in extraReducers?
// builder is an object that helps manage different action types automatically created by createAsyncThunk:

// pending – When the request starts.
// fulfilled – When the request is successful.
// rejected – When the request fails.
// Why Use builder?
// It allows us to define how the Redux state should update for each case.

// Final Takeaways
// ✔️ createAsyncThunk handles API calls.
// ✔️ extraReducers updates Redux state based on API responses.
// ✔️ dispatch() triggers actions like login, logout, register.

// Use reducers → For synchronous state updates (e.g., toggling UI, counters).
// Use createAsyncThunk + extraReducers → For asynchronous operations (e.g., API calls).

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  api,
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  getUserChannelProfile,
  updateAvatar,
  updateCoverImage,
  updateUserAccountDetails,
  verifyOtp,
  resendOtp,
  changePassword,
  resetPassword,
  verifyResetOtp,
  sendResetOtp,
  deleteuser,
} from "../../api/AuthApi.js";

export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    try {
      // console.log("caling the refreshAuthToken :");
      const newToken = await refreshToken(); // Call API to refresh

      if (!newToken) {
        return thunkAPI.rejectWithValue("Token refresh failed");
      }

      // Set new token for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return newToken;
    } catch (error) {
      return thunkAPI.rejectWithValue("Token refresh failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      // console.log("Fetching current user...");
      const response = await getCurrentUser();
      // console.log("Current user response:", response);
      if (response) return response;
    } catch (error) { // handle the error before the Axios interceptor gets a chance to handle it.
       // Manually refreshing token
      if (error.response?.status === 401) {
        // console.log("Token expired, attempting to refresh...");
        try {
          const newToken = await thunkAPI.dispatch(refreshAuthToken()).unwrap();
          if (newToken) {
            // console.log("Token refreshed, retrying fetchCurrentUser...");
            return await getCurrentUser(); // Retry fetching user
          }
        } catch (refreshError) {
          // console.log("Token refresh failed:", refreshError);
          return thunkAPI.rejectWithValue("Token refresh failed");
        }
      }
    }
    return thunkAPI.rejectWithValue("Failed to fetch user");
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    const response = await login(userData); // Calls the API function
    if (!response.success) return thunkAPI.rejectWithValue(response.message); // If error, send it to Redux state
    return response; // Otherwise, return the user data to store it in Redux state
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    const response = await register(formData);
    console.log("register res:", response)
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response;
  }
);

export const verifyUserOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, thunkAPI) => {
    const response = await verifyOtp(email, otp);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response;
  }
);

export const resendOtpAction = createAsyncThunk(
  "auth/resendOtp",
  async (email, thunkAPI) => {
    try {
      console.log("email", email);
      const response = await resendOtp(email);
      return response; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error); 
    }
  }
);

export const changePasswordAction = createAsyncThunk(
  "auth/changePassword",
  async ({oldPassword, newPassword}, thunkAPI) => {
    try {
      const response = await changePassword({oldPassword, newPassword});
      return response;
    } catch (error) {
      // Handle both string errors and error objects
      return thunkAPI.rejectWithValue(
        typeof error === 'string' ? error : 
        error.response?.data?.message || 
        error.message || 
        "Failed to change password"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    const response = await logout();
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return null; // Clears user state
  }
);


export const fetchUserChannelProfile = createAsyncThunk(
  "auth/fetchUserChannelProfile",
  async (username, thunkAPI) => {
    const response = await getUserChannelProfile(username);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response;
  }
);

// AuthSlice.js

// Update Avatar
export const updateUserAvatar = createAsyncThunk(
  "auth/updateAvatar",
  async (avatarFile, thunkAPI) => {
    const response = await updateAvatar(avatarFile);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data; // Return updated user data
  }
);

// Update Cover Image
export const updateUserCoverImage = createAsyncThunk(
  "auth/updateCoverImage",
  async (coverImageFile, thunkAPI) => {
    const response = await updateCoverImage(coverImageFile);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data; // Return updated user data
  }
);

// Update Account Details
export const updateAccountDetails = createAsyncThunk(
  "auth/updateAccountDetails",
  async (accountData, thunkAPI) => {
    const response = await updateUserAccountDetails(accountData);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data; // Return updated user data
  }
);


// Thunks for async actions
export const sendOtpThunk = createAsyncThunk("auth/sendOtp", async (email, { rejectWithValue }) => {
  try {
    return await sendResetOtp(email);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const verifyOtpThunk = createAsyncThunk("auth/verifyOtp", async ({ email, otp }, { rejectWithValue }) => {
  try {
    return await verifyResetOtp(email, otp);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const resetPasswordThunk = createAsyncThunk("auth/resetPassword", async ({ email, newPassword }, { rejectWithValue }) => {
  try {
    return await resetPassword(email, newPassword);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const deleteUserThunk = createAsyncThunk(
  "auth/deleteuser",
  async (email, thunkAPI) => {
    const response = await deleteuser(email); // Calls the API function
    if (!response.success) return thunkAPI.rejectWithValue(response.message); // If error, send it to Redux state
    return response; // Otherwise, return the user data to store it in Redux state
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
  userChannelProfile: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Login Cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Clear previous error before making a new request
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.accessToken;
        state.isLoading = false;
        // console.log("Access Token from Redux:", action.payload.data.accessToken);
        
        // Ensure token is set globally in Axios
        api.defaults.headers.common["Authorization"] = `Bearer ${action.payload.data.accessToken}`;
        // console.log("Set Authorization Header:", api.defaults.headers.common["Authorization"]);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = action.payload;
      })

      
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.data;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = "Failed to authenticate user";
      })

      // Refresh Token
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        
        api.defaults.headers.common["Authorization"] = `Bearer ${action.payload}`;
        // **Fix: Ensure token is updated globally**
        // api.defaults.headers.common["Authorization"] = `Bearer ${action.payload}`;
      })
      
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = "Token refresh failed";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = null;

        delete api.defaults.headers.common["Authorization"]; 
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Logout failed";
      })

      .addCase(fetchUserChannelProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserChannelProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.userChannelProfile = action.payload.data; // Store user channel profile in state
      })
      .addCase(fetchUserChannelProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch user channel profile";
      })

      // Update Avatar
      .addCase(updateUserAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // Update user data with new avatar
        state.error = null;
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update avatar";
      })

      // Update Cover Image
      .addCase(updateUserCoverImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserCoverImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // Update user data with new cover image
        state.error = null;
      })
      .addCase(updateUserCoverImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update cover image";
      })

      // Update Account Details
      .addCase(updateAccountDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAccountDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // Update user data with new account details
        state.error = null;
      })
      .addCase(updateAccountDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update account details";
      });
  },
});

export default authSlice.reducer;
