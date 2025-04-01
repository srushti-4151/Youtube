import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clearHistory, deleteHistoryItem, getWatchHistory } from "../../api/viewsApi.js";

// Async action to fetch watch history
export const fetchWatchHistory = createAsyncThunk(
  "watchHistory/fetchWatchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getWatchHistory();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a single video from watch history
export const removeFromHistory = createAsyncThunk(
  "watchHistory/removeFromHistory",
  async (videoId, { rejectWithValue }) => {
    try {
      return await deleteHistoryItem(videoId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Clear entire watch history
export const clearWatchHistory = createAsyncThunk(
  "watchHistory/clearWatchHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await clearHistory();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const watchHistorySlice = createSlice({
  name: "views",
  initialState: {
    history: [],
    addLoading: false,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove a single item
      .addCase(removeFromHistory.fulfilled, (state, action) => {
        state.history = state.history.filter(item => item.video._id !== action.payload);
      })
      // Clear history
      .addCase(clearWatchHistory.fulfilled, (state) => {
        state.history = [];
      });
  },
});

export default watchHistorySlice.reducer;
