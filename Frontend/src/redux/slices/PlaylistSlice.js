import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createNewPlaylist,
  getPlaylistById,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../../api/PlaylistsApi.js";

// Create a new playlist
export const createPlaylist = createAsyncThunk(
  "playlists/createPlaylist",
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const playlist = await createNewPlaylist(name, description);
      return playlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create playlist"
      );
    }
  }
);

// Get a playlist by ID
export const fetchPlaylistById = createAsyncThunk(
  "playlists/fetchPlaylistById",
  async (playlistId, { rejectWithValue }) => {
    try {
      const playlist = await getPlaylistById(playlistId);
      return playlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch playlist"
      );
    }
  }
);

// Get all user playlists
export const fetchUserPlaylists = createAsyncThunk(
  "playlists/fetchUserPlaylists",
  async (userId, { rejectWithValue }) => {
    try {
      const playlists = await getUserPlaylists(userId);
      return playlists;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user playlists"
      );
    }
  }
);

// Update a playlist
export const editPlaylist = createAsyncThunk(
  "playlists/editPlaylist",
  async ({ playlistId, updates }, { rejectWithValue }) => {
    try {
      const updatedPlaylist = await updatePlaylist(playlistId, updates);
      return updatedPlaylist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update playlist"
      );
    }
  }
);

// Delete a playlist
export const removePlaylist = createAsyncThunk(
  "playlists/removePlaylist",
  async (playlistId, { rejectWithValue }) => {
    try {
      await deletePlaylist(playlistId);
      return playlistId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete playlist"
      );
    }
  }
);

// Add a video to a playlist
export const addVideo = createAsyncThunk(
  "playlists/addVideo",
  async ({ playlistId, videoId }, { rejectWithValue }) => {
    try {
      const updatedPlaylist = await addVideoToPlaylist(playlistId, videoId);
      return updatedPlaylist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add video to playlist"
      );
    }
  }
);

// Remove a video from a playlist
export const removeVideo = createAsyncThunk(
  "playlists/removeVideo",
  async ({ playlistId, videoId }, { rejectWithValue }) => {
    try {
      const updatedPlaylist = await removeVideoFromPlaylist(
        playlistId,
        videoId
      );
      return updatedPlaylist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove video from playlist"
      );
    }
  }
);

const initialState = {
  userPlaylists: [],
  selectedPlaylist: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

const playlistSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Add Video to Playlist
      .addCase(addVideo.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(addVideo.fulfilled, (state, action) => {
        state.isUpdating = false;
        console.log("API Response Data:", action.payload.data);
        // Finds the playlist in state.userPlaylists that matches the updated one from the API.
        // If we found the playlist in Redux state, we replace it with the updated one.
        // If not found, we log a warning.
        const index = state.userPlaylists.findIndex(
          (p) => p._id === action.payload.data._id
        );
        if (index !== -1) state.userPlaylists[index] = action.payload.data;
      })
      .addCase(addVideo.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Get user playlists
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPlaylists = action.payload.data;
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Playlist
      .addCase(createPlaylist.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.isCreating = false;
        state.userPlaylists.push(action.payload.data);
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Get a playlist by ID
      .addCase(fetchPlaylistById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlaylistById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPlaylist = action.payload.data;
      })
      .addCase(fetchPlaylistById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Playlist
      .addCase(editPlaylist.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(editPlaylist.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.userPlaylists.findIndex(
          (p) => p._id === action.payload.data._id
        );
        if (index !== -1) state.userPlaylists[index] = action.payload.data;
      })
      .addCase(editPlaylist.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Delete Playlist
      .addCase(removePlaylist.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(removePlaylist.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.userPlaylists = state.userPlaylists.filter(
          (p) => p._id !== action.payload
        );
      })
      .addCase(removePlaylist.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

      // Remove Video from Playlist
      .addCase(removeVideo.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(removeVideo.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.userPlaylists.findIndex(
          (p) => p._id === action.payload.data._id
        );
        if (index !== -1) state.userPlaylists[index] = action.payload.data;
      })
      .addCase(removeVideo.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export default playlistSlice.reducer;
