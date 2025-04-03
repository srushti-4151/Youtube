import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addTweetComment, getTweetComments } from "../../api/TweetComment.js";

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
  async ({ tweetId, commentData }, thunkAPI) => {
    const response = await addTweetComment(tweetId, commentData);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data;
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
      });
  },
});

export default tweetcommentsSlice.reducer;
