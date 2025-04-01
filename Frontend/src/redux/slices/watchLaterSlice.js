import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getWatchLaterVideos, addToWatchLater, removeFromWatchLater } from "../../api/watchlaterApi.js";

// Initial state with more detailed loading states
const initialState = {
  watchLater: [],
  loading: false,
  fetchLoading: false,
  addLoading: false,
  removeLoading: false,
  error: null
};

// Fetch Watch Later Videos
export const fetchWatchLater = createAsyncThunk(
  "watchLater/fetchWatchLater",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWatchLaterVideos();
      return response.data || response; // Handle both Axios response and direct data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add Video to Watch Later
export const addWatchLater = createAsyncThunk(
  "watchLater/addWatchLater",
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await addToWatchLater(videoId);
      return response.data || response; // Handle both Axios response and direct data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Remove Video from Watch Later
export const removeWatchLater = createAsyncThunk(
  "watchLater/removeWatchLater",
  async (videoId, { rejectWithValue }) => {
    try {
      await removeFromWatchLater(videoId);
      return videoId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const watchLaterSlice = createSlice({
  name: "watchLater",
  initialState,
  reducers: {
    // Optional: Add manual reset if needed
    resetWatchLaterState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Watch Later Videos
      .addCase(fetchWatchLater.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchLater.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.watchLater = action.payload || [];
      })
      .addCase(fetchWatchLater.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      })

      // Add to Watch Later
      .addCase(addWatchLater.pending, (state) => {
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addWatchLater.fulfilled, (state, action) => {
        state.addLoading = false;
        // Safely add the new item (immutable update)
        if (action.payload) {
          state.watchLater = [action.payload, ...state.watchLater];
        }
      })
      .addCase(addWatchLater.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload;
      })

      // Remove from Watch Later
      .addCase(removeWatchLater.pending, (state) => {
        state.removeLoading = true;
        state.error = null;
      })
      .addCase(removeWatchLater.fulfilled, (state, action) => {
        state.removeLoading = false;
        // More robust removal that handles different item structures
        state.watchLater = state.watchLater.filter(item => 
          item?.video?._id !== action.payload && 
          item?._id !== action.payload
        );
      })
      .addCase(removeWatchLater.rejected, (state, action) => {
        state.removeLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetWatchLaterState } = watchLaterSlice.actions;
export default watchLaterSlice.reducer;