import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getUserSubscribers,
  getSubscribedChannels,
  toggleSubscription,
  checkSubscriptionStatus,
} from "../../api/SubscriptionApi.js";

// Fetch user subscribers count
export const checkIsSubscribed = createAsyncThunk(
  "subscriptions/checkIsSubscribed",
  async (username, thunkAPI) => {
    try {
      const response = await checkSubscriptionStatus(username);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.message || "Failed to fetch subscribe status"
      );
    }
  }
);

// Fetch user subscribers count
export const fetchUserSubscribers = createAsyncThunk(
  "subscriptions/fetchUserSubscribers",
  async (channelId, thunkAPI) => {
    try {
      const response = await getUserSubscribers(channelId);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscribers"
      );
    }
  }
);

// Fetch subscribed channels for a user
export const fetchSubscribedChannels = createAsyncThunk(
  "subscriptions/fetchSubscribedChannels",
  async (userId, thunkAPI) => {
    try {
      const response = await getSubscribedChannels(userId);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscribed channels"
      );
    }
  }
);

// Toggle Subscription (Subscribe/Unsubscribe)
export const toggleUserSubscription = createAsyncThunk(
  "subscriptions/toggleSubscription",
  async (channelId, thunkAPI) => {
    try {
      const response = await toggleSubscription(channelId);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Subscription toggle failed"
      );
    }
  }
);

const initialState = {
  isSubscribed: false,
  subscribers: 0,
  subscribedChannels: [],
  isLoading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkIsSubscribed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkIsSubscribed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSubscribed = action.payload?.isSubscribed || false;
      })
      .addCase(checkIsSubscribed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserSubscribers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscribers.fulfilled, (state, action) => {
        state.subscribers = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUserSubscribers.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(fetchSubscribedChannels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscribedChannels.fulfilled, (state, action) => {
        state.subscribedChannels = action.payload.channels || []; // Store subscribed channels
        state.isLoading = false;
      })
      .addCase(fetchSubscribedChannels.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(toggleUserSubscription.fulfilled, (state, action) => {
        const { channelId, isSubscribed } = action.payload;
        // if (isSubscribed) {
        //   state.subscribedChannels.push(channelId); // Add to subscribed list
        //   state.subscribersCount += 1; // Increment count
        // } else {
        //   state.subscribedChannels = state.subscribedChannels.filter(id => id !== channelId); // Remove from list
        //   state.subscribersCount -= 1; // Decrement count
        // }
      });
  },
});

export default subscriptionSlice.reducer;
