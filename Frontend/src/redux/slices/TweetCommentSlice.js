import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addTweetComment,
  deleteTweetComment,
  getTweetComments,
  updateTweetComment,
} from "../../api/TweetComment.js";

// Async Thunks
export const fetchTweetComments = createAsyncThunk(
  "comments/fetchTweetComments",
  async (tweetId, thunkAPI) => {
    const response = await getTweetComments(tweetId);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data;
  }
);

export const createTweetComment = createAsyncThunk(
  "comments/createTweetComment",
  // async ({ tweetId, commentData }, thunkAPI) => {
  //   const response = await addTweetComment(tweetId, commentData);
  //   if (!response.success) return thunkAPI.rejectWithValue(response.message);
  //   return response.data;
  // }
  async ({ tweetId, content, parentComment = null }, thunkAPI) => {
      const commentData = { content };
      if (parentComment) {
        commentData.parentComment = parentComment; // Only add if it's a reply
      }
      const response = await addTweetComment(tweetId, commentData);
      if (!response.success) return thunkAPI.rejectWithValue(response.message);
      return response.data;
    }
);

export const editTweetComment = createAsyncThunk(
  "comments/editComment",
  async ({ tweetId, updatedData }, thunkAPI) => {
    const response = await updateTweetComment(tweetId, updatedData);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data;
  }
);

export const removeTweetComment = createAsyncThunk(
  "comments/removeComment",
  async (tweetId, thunkAPI) => {
    const response = await deleteTweetComment(tweetId);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return tweetId;
  }
);

// Initial State
const initialState = {
  comments: [],
  ComisLoading: false,
  error: null,
};

// Slice
const tweetcommentsSlice = createSlice({
  name: "tweetcomments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchTweetComments.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(fetchTweetComments.fulfilled, (state, action) => {
        state.ComisLoading = false;
        state.comments = action.payload.comments;
      })
      .addCase(fetchTweetComments.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      })

      // Add Comment
      .addCase(createTweetComment.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(createTweetComment.fulfilled, (state, action) => {
        state.ComisLoading = false;
      })

      .addCase(createTweetComment.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      })

      // Update Comment
      .addCase(editTweetComment.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(editTweetComment.fulfilled, (state, action) => {
        state.ComisLoading = false;
      })
      .addCase(editTweetComment.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      })

      // Delete Comment
      .addCase(removeTweetComment.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(removeTweetComment.fulfilled, (state, action) => {
        state.ComisLoading = false;
      })
      .addCase(removeTweetComment.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      });
  },
});

export default tweetcommentsSlice.reducer;
