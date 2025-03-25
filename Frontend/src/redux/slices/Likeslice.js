import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCommentLikesStatus, getVideoLikesStatus, toggleCommentLike, toggleVideoLike } from "../../api/LikeApi.js";

// Toggle Like/Dislike Thunk
export const toggleLike = createAsyncThunk(
  "like/toggleLike",
  async ({ videoId, type }, { rejectWithValue }) => {
    console.log("Received videoId in thunk:", videoId);
    try {
      const response = await toggleVideoLike(videoId, type);
      // console.log("Like API Response:", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// Fetch Like Status Thunk
export const getVideoLikesStatusapi = createAsyncThunk(
  "like/getVideoLikesStatusapi",
  async ( videoId, { rejectWithValue }) => { 
    try {
      console.log("videooooo id" ,videoId)
      const response = await getVideoLikesStatus(videoId);
      // console.log("Like getVideoLikesStatus API Response:", response);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// Toggle Like/Dislike Thunk for Comments
export const toggleCommentLikeThunk = createAsyncThunk(
  "like/toggleCommentLike",
  async ({ commentId, type }, { rejectWithValue }) => {
    try {
      const response = await toggleCommentLike(commentId, type);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// Fetch Like Status Thunk for Comments
export const getCommentLikesStatusapi = createAsyncThunk(
  "like/getCommentLikesStatus",
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await getCommentLikesStatus(commentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const likeSlice = createSlice({
  name: "like",
  initialState: {
    likeStatus: null,
    likeStatusComments: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleLike.pending, (state) => {
        state.status = "loading";
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.status = "succeeded";
        
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Video Like Status
      .addCase(getVideoLikesStatusapi.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVideoLikesStatusapi.fulfilled, (state, action) => {
        state.likeStatus = action.payload; // Store like status from API
      })
      .addCase(getVideoLikesStatusapi.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })


      .addCase(toggleCommentLikeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(toggleCommentLikeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(toggleCommentLikeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Comment Like Status
      .addCase(getCommentLikesStatusapi.pending, (state) => {
        state.status = "loading";
      })
      // Modify the getCommentLikesStatusapi fulfilled case
      .addCase(getCommentLikesStatusapi.fulfilled, (state, action) => {
        if (action.payload?.commentId) {
          state.likeStatusComments[action.payload.commentId] = action.payload;
        }
      })
      .addCase(getCommentLikesStatusapi.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default likeSlice.reducer;
