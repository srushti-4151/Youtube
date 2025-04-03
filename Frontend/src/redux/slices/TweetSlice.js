import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createTweet, getUserTweets } from "../../api/TweetApi.js";

// Add a new tweet (supports image + text)
export const addTweet = createAsyncThunk(
  "tweets/addTweet",
  async (formData, thunkAPI) => {
    try {
      const response = await createTweet(formData);
      if (!response.success) return thunkAPI.rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Fetch tweets of a specific user
export const fetchUserTweets = createAsyncThunk(
  "tweets/fetchUserTweets",
  async (userId, thunkAPI) => {
    try {
      const response = await getUserTweets(userId);
      if (!response.success) return thunkAPI.rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Initial State
const initialState = {
  tweets: [],
  tweetsLoading: false,
  error: null,
};

// Slice
const tweetSlice = createSlice({
  name: "tweets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Tweet Cases
      .addCase(addTweet.pending, (state) => {
        state.tweetsLoading = true;
        state.error = null;
      })
      .addCase(addTweet.fulfilled, (state, action) => {
        state.tweetsLoading = false;
        state.tweets.unshift(action.payload); // Add new tweet at the top
      })
      .addCase(addTweet.rejected, (state, action) => {
        state.tweetsLoading = false;
        state.error = action.payload;
      })

      // Fetch User Tweets Cases
      .addCase(fetchUserTweets.pending, (state) => {
        state.tweetsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTweets.fulfilled, (state, action) => {
        state.tweetsLoading = false;
        state.tweets = action.payload;
      })
      .addCase(fetchUserTweets.rejected, (state, action) => {
        state.tweetsLoading = false;
        state.error = action.payload;
      });
  },
});

export default tweetSlice.reducer;
