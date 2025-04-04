import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCommentLikesStatus,
  getLikedVideos,
  getTweetCommentLikesStatus,
  getTweetLikesStatus,
  getVideoLikesStatus,
  toggleCommentLike,
  toggleTweetCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../../api/LikeApi.js";

export const fetchLikedVideos = createAsyncThunk(
  "like/fetchLikedVideos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLikedVideos();
      console.log("getLikedVideos API Response.data :", response);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

//VIDEO : toggle
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

//VIDEO : GET
export const getVideoLikesStatusapi = createAsyncThunk(
  "like/getVideoLikesStatusapi",
  async (videoId, { rejectWithValue }) => {
    try {
      // console.log("videooooo id" ,videoId)
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

//VIDOE COMMENT : Toggle 
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

//VIDEO COMMENT : GET
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

//TWEET : GET
export const getTweetLikesStatusapi = createAsyncThunk(
  "like/getTweetLikesStatusapi",
  async (tweetId, { rejectWithValue }) => {
    try {
      const response = await getTweetLikesStatus(tweetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

//TWEET : TOGGLE
export const toggleTweetLikeThunk = createAsyncThunk(
  "like/toggleTweetLikeThunk",
  async ({ tweetId, type }, { rejectWithValue }) => {
    console.log("tweet id and type", tweetId, type);
    try {
      const response = await toggleTweetLike(tweetId, type);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

//TWEET COMMNET : GET
export const getTweetCommentLikesStatusapi = createAsyncThunk(
  "like/getTweetCommentLikesStatusapi",
  async (tweetComId, { rejectWithValue }) => {
    try {
      const response = await getTweetCommentLikesStatus(tweetComId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

//TWEET COMMENT : TOGGLE
export const toggleTweetCommentLikeThunk = createAsyncThunk(
  "like/toggleTweetCommentLikeThunk",
  async ({ tweetComId, type }, { rejectWithValue }) => {
    try {
      const response = await toggleTweetCommentLike(tweetComId, type);
      return response;
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
    likeVideos: [],
    isvideosLoading: false,
    likeStatus: null,
    likeStatusTweetComments: {},
    likeStatusComments: {},
    likeStatusTweet: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikedVideos.pending, (state) => {
        state.isvideosLoading = true;
      })
      .addCase(fetchLikedVideos.fulfilled, (state, action) => {
        state.likeVideos = action.payload.videos;
        state.isvideosLoading = false;
      })
      .addCase(fetchLikedVideos.rejected, (state, action) => {
        state.error = action.payload;
        state.isvideosLoading = false;
      })

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
      .addCase(getCommentLikesStatusapi.fulfilled, (state, action) => {
        if (action.payload?.commentId) {
          state.likeStatusComments[action.payload.commentId] = action.payload;
        }
      })
      .addCase(getCommentLikesStatusapi.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      //Tweet
      .addCase(getTweetLikesStatusapi.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTweetLikesStatusapi.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload?.tweetId) {
          state.likeStatusTweet[action.payload.tweetId] = action.payload;
          };
      })
      
      .addCase(getTweetLikesStatusapi.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      //toggleTweetLikeThunk
      .addCase(toggleTweetLikeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(toggleTweetLikeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(toggleTweetLikeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(getTweetCommentLikesStatusapi.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTweetCommentLikesStatusapi.fulfilled, (state, action) => {
        if (action.payload?.tweetComId) {
          state.likeStatusTweetComments[action.payload.tweetComId] = action.payload;
        }
      })
      .addCase(getTweetCommentLikesStatusapi.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(toggleTweetCommentLikeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(toggleTweetCommentLikeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(toggleTweetCommentLikeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
  },
});

export default likeSlice.reducer;
