import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { searchVideos } from "../../api/VideoApi.js";

// Async function to fetch searched videos
export const fetchSearchResults = createAsyncThunk(
  "videos/fetchSearchResults",
  async (query, thunkAPI) => {
    try {
      const response = await searchVideos(query);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch search results");
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: { 
    results: { 
        videos: [], 
        channels: [] 
    }, 
    loading: false, 
    error: null 
   },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setQuery } = searchSlice.actions;
export default searchSlice.reducer;
