import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addToWatchHistory, getWatchHistory } from "../../api/viewsApi.js";

// Async action to fetch watch history
export const fetchWatchHistory = createAsyncThunk(
  "watchHistory/fetchWatchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getWatchHistory();
      return data.history;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add video to watch history
export const addHistory = createAsyncThunk(
  "watchHistory/addHistory",
  async (videoId, { rejectWithValue }) => {
    try {
      console.log("Sice Add History videoId.......:", videoId);
      const data = await addToWatchHistory(videoId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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

      // Add to Watch History Cases
      .addCase(addHistory.pending, (state) => {
        console.log("addHistory API called"); 
        state.addLoading = true;
      })
      .addCase(addHistory.fulfilled, (state, action) => {
        state.addLoading = false;
        console.log("entry add to history:", action.payload);
      })
      .addCase(addHistory.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload;
      });
  },
});

export default watchHistorySlice.reducer;
