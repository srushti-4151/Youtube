// commentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../../api/CommentsApi.js";

// Async Thunks
export const fetchVideoComments = createAsyncThunk(
  "comments/fetchVideoComments",
  async (videoId, thunkAPI) => {
    const response = await getVideoComments(videoId);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data;
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  // async ({ videoId, commentData }, thunkAPI) => {
  //   const response = await addComment(videoId, commentData);
  //   if (!response.success) return thunkAPI.rejectWithValue(response.message);
  //   return response.data;
  // }
  async ({ videoId, content, parentComment = null }, thunkAPI) => {
    const commentData = { content };
    if (parentComment) {
      commentData.parentComment = parentComment; // Only add if it's a reply
    }
    const response = await addComment(videoId, commentData);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data;
  }
);

export const editComment = createAsyncThunk(
  "comments/editComment",
  async ({ commentId, updatedData }, thunkAPI) => {
    const response = await updateComment(commentId, updatedData);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return response.data;
  }
);

export const removeComment = createAsyncThunk(
  "comments/removeComment",
  async (commentId, thunkAPI) => {
    const response = await deleteComment(commentId);
    if (!response.success) return thunkAPI.rejectWithValue(response.message);
    return commentId; // Return the deleted comment ID
  }
);

// Initial State
const initialState = {
  comments: [],
  ComisLoading: false,
  error: null,
};

// Slice
const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchVideoComments.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoComments.fulfilled, (state, action) => {
        state.ComisLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchVideoComments.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      })

      // Add Comment
      .addCase(createComment.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.ComisLoading = false;
        // Ensure state.comments is an array before using unshift
        // if (!Array.isArray(state.comments)) {
        //   state.comments = [];
        // }
        // console.log("state.comments before adding", state.comments);
        // console.log("action.payload", action.payload);

        // state.comments.unshift(action.payload); // Add new comment to the top
      })

      .addCase(createComment.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      })

      // Update Comment
      .addCase(editComment.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        state.ComisLoading = false;
      })
      .addCase(editComment.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      })

      // Delete Comment
      .addCase(removeComment.pending, (state) => {
        state.ComisLoading = true;
        state.error = null;
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        state.ComisLoading = false;
      })
      .addCase(removeComment.rejected, (state, action) => {
        state.ComisLoading = false;
        state.error = action.payload;
      });
  },
});

export default commentSlice.reducer;
