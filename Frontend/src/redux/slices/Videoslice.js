import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllVideos,
  getAllVideosById,
  getVideoById,
  uploadNewVideo
} from "../../api/VideoApi.js";

// Fetch all videos from API
export const fetchAllVideos = createAsyncThunk(
  "videos/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await getAllVideos();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch videos");
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  "videos/fetchById",
  async (videoId, thunkAPI) => {
    try {
      const response = await getVideoById(videoId);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch video by ID");
    }
  }
);

export const fetchUserVideos = createAsyncThunk(
  "videos/fetchUserVideos",
  async (userId, thunkAPI) => {
    // Accept userId
    try {
      const data = await getAllVideosById(userId);
      console.log("data", data);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch user's videos");
    }
  }
);

// Upload a new video
export const uploadVideo = createAsyncThunk("videos/uploadVideo", async (formData, { rejectWithValue }) => {
  try {
    const uploadedVideo = await uploadNewVideo(formData);
    // dispatch(fetchUserVideos(uploadedVideo.owner)); // Refresh user videos after upload
    return uploadedVideo;
  } catch (error) {
    console.error("Upload error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Upload failed");
  }
});


const initialState = {
  videos: [],
  userVideos: [], // Now an array
  pagination: null, // Stores pagination details
  selectedVideo: null,
  isLoading: false,
  error: null,
};

const videoSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllVideos.fulfilled, (state, action) => {
        state.videos = action.payload.data;
        state.isLoading = false;
      })
      .addCase(fetchAllVideos.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(fetchVideoById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.selectedVideo = action.payload.data;
        state.isLoading = false;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(fetchUserVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserVideos.fulfilled, (state, action) => {
        // console.log("Fetched User Videos Data:", action.payload); 
        state.userVideos = action.payload.data.videos || []; 
        state.pagination = action.payload.data.pagination || null;
        state.isLoading = false;
      })
      .addCase(fetchUserVideos.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.userVideos.unshift(action.payload); // Add new video to the UI instantly
      })
  },
});

export default videoSlice.reducer;
