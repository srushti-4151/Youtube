import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteVideoById,
  getAllVideos,
  getAllVideosById,
  getAllVideosOfUser,
  getVideoById,
  updateVideoDetails,
  uploadNewVideo,
} from "../../api/VideoApi.js";


// Upload a new video
export const uploadVideo = createAsyncThunk(
  "videos/uploadVideo",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("redux",formData)
      const uploadedVideo = await uploadNewVideo(formData);
      // dispatch(fetchUserVideos(uploadedVideo.owner)); // Refresh user videos after upload
      return uploadedVideo;
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

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

export const fetchAllVideosOfUser = createAsyncThunk(
  "videos/fetchAllVideosOfUser",
  async (userId, thunkAPI) => {
    // Accept userId
    try {
      const response = await getAllVideosOfUser(userId);
      console.log("response", response);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch user's videos");
    }
  }
);

// export const updateVideo = createAsyncThunk(
//   "videos/update",
//   async ({ videoId, updatedata }, { rejectWithValue }) => {
//     try {
//       console.log("dataaaaaaaaaain slice", updatedata, videoId)
//       const response = await updateVideoDetails(videoId, updatedata);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "update failed");
//     }
//   }
// );

export const updateVideo = createAsyncThunk(
  "videos/update",
  async ({ videoId, formData }, { rejectWithValue }) => {  // Change updateData to formData
    try {
      const response = await updateVideoDetails(videoId, formData);
      return response.data;  // Make sure to return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "update failed");
    }
  }
);

export const deleteVideo = createAsyncThunk(
  "videos/delete",
  async (videoId, { rejectWithValue }) => {
    try {
      console.log("video Id", videoId)
      const response = await deleteVideoById(videoId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

const initialState = {
  videos: [],
  userVideos: [], // Now an array
  userAllVideos: [],
  pagination: null, // Stores pagination details
  selectedVideo: null,
  AllLoading: false,
  isLoading: false,
  isUpdating: false,
  isDeleting: false,
  isUploading: false,
  isvideosLoading: false,
  isuserVidLoading: false,
  error: null,
};

const videoSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch all videos
      .addCase(fetchAllVideos.pending, (state) => {
        state.AllLoading = true;
      })
      .addCase(fetchAllVideos.fulfilled, (state, action) => {
        state.videos = action.payload.data;
        state.AllLoading = false;
      })
      .addCase(fetchAllVideos.rejected, (state, action) => {
        state.error = action.payload;
        state.AllLoading = false;
      })

      // Fetch video By id
      .addCase(fetchVideoById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.selectedVideo = action.payload.data || null;
        state.isLoading = false;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      // Fetch user videos
      .addCase(fetchUserVideos.pending, (state) => {
        state.isvideosLoading = true;
      })
      .addCase(fetchUserVideos.fulfilled, (state, action) => {
        // console.log("Fetched User Videos Data:", action.payload);
        state.userVideos = action.payload.data.videos || [];
        state.pagination = action.payload.data.pagination || null;
        state.isvideosLoading = false;
      })
      .addCase(fetchUserVideos.rejected, (state, action) => {
        state.error = action.payload;
        state.isvideosLoading = false;
      })

      // Fetch user all videos
      .addCase(fetchAllVideosOfUser.pending, (state) => {
        state.isuserVidLoading = true;
      })
      .addCase(fetchAllVideosOfUser.fulfilled, (state, action) => {
        // console.log("Fetched User Videos Data:", action.payload);
        state.userAllVideos = action.payload.videos || [];
        state.isuserVidLoading = false;
      })
      .addCase(fetchAllVideosOfUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isuserVidLoading = false;
      })

      // Upload video
      .addCase(uploadVideo.pending, (state) => {
        state.isUploading = true;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.isUploading = false;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })

      // Update video
      .addCase(updateVideo.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.isUpdating = false;
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Delete video
      .addCase(deleteVideo.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.isDeleting = false;
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  },
});

export default videoSlice.reducer;
