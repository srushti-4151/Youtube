import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createTweet, deleteTweet, getTweetById, getUserTweets, updateTweet } from "../../api/TweetApi.js";

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

export const fetchTweetById = createAsyncThunk(
  "tweets/fetchTweetById",
  async (tweetId, thunkAPI) => {
    try {
      const response = await getTweetById(tweetId);
      if (!response.success) return thunkAPI.rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
// Update a tweet (only content)
export const editTweet = createAsyncThunk(
  "tweets/editTweet",
  async ({ tweetId, content }, thunkAPI) => {
    try {
      const response = await updateTweet(tweetId, content); // Send only content
      if (!response.success) return thunkAPI.rejectWithValue(response.message);
      return { tweetId, updatedContent: response.data.content }; // Store only updated content
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Delete a tweet
export const removeTweet = createAsyncThunk(
  "tweets/removeTweet",
  async (tweetId, thunkAPI) => {
    try {
      const response = await deleteTweet(tweetId);
      if (!response.success) return thunkAPI.rejectWithValue(response.message);
      return tweetId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Initial State
const initialState = {
  tweets: [],
  tweet: [],
  tweetsLoading: false,
  tweetLoading: false,
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
      })

      //fetchTweetById 
      .addCase(fetchTweetById.pending, (state) => {
        state.tweetLoading = true;
        state.error = null;
      })
      .addCase(fetchTweetById.fulfilled, (state, action) => {
        state.tweetLoading = false;
        state.tweet = action.payload;
      })
      .addCase(fetchTweetById.rejected, (state, action) => {
        state.tweetLoading = false;
        state.error = action.payload;
      })
      
      // Update Tweet Cases (only content)
      .addCase(editTweet.pending, (state) => {
        state.tweetsLoading = true;
        state.error = null;
      })
      .addCase(editTweet.fulfilled, (state, action) => {
        state.tweetsLoading = false;
        const { tweetId, updatedContent } = action.payload;
        const tweet = state.tweets.find((tweet) => tweet._id === tweetId);
        if (tweet) {
          tweet.content = updatedContent; // Only update the content field
        }
      })
      .addCase(editTweet.rejected, (state, action) => {
        state.tweetsLoading = false;
        state.error = action.payload;
      })

       // Delete Tweet Cases
       .addCase(removeTweet.pending, (state) => {
        state.tweetsLoading = true;
        state.error = null;
      })
      .addCase(removeTweet.fulfilled, (state, action) => {
        state.tweetsLoading = false;
        state.tweets = state.tweets.filter(
          (tweet) => tweet._id !== action.payload
        );
      })
      .addCase(removeTweet.rejected, (state, action) => {
        state.tweetsLoading = false;
        state.error = action.payload;
      });
  },
});

export default tweetSlice.reducer;
