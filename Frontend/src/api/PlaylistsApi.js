import { api } from "./AuthApi";

const PLAYLIST_API_URL = "https://youtube-ydae.onrender.com/api/v1/playlists";

export const createNewPlaylist = async (name, description) => {
  try {
    const response = await api.post(`${PLAYLIST_API_URL}`, { name, description });
    return response.data;
  } catch (error) {
    console.error(
      "Create Playlist Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getPlaylistById = async (PlaylistId) => {
  try {
    const response = await api.get(`${PLAYLIST_API_URL}/${PlaylistId}`);
    console.log("getPlaylistById response :", response);
    return response.data;
  } catch (error) {
    console.log("get Playlist Error: ", error.response?.data?.message);
    throw error;
  }
};

export const getUserPlaylists = async (userId) => {
  try {
    const response = await api.get(`${PLAYLIST_API_URL}/user/${userId}`);
    console.log("user playlis :", response)
    return response.data;
  } catch (error) {
    console.error("Get User Playlists Error:", error.response?.data?.message);
    throw error;
  }
};

// Update a playlist
export const updatePlaylist = async (playlistId, updates) => {
  try {
    const response = await api.patch(
      `${PLAYLIST_API_URL}/${playlistId}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error(
      "Update Playlist Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete a playlist
export const deletePlaylist = async (playlistId) => {
  try {
    const response = await api.delete(`${PLAYLIST_API_URL}/${playlistId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete Playlist Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Add a video to a playlist
export const addVideoToPlaylist = async (playlistId, videoId) => {
  try {
    const response = await api.patch(
      `${PLAYLIST_API_URL}/add/${videoId}/${playlistId}`
    );
    console.log("api response : ", response)
    return response.data;
  } catch (error) {
    console.error(
      "Add Video to Playlist Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Remove a video from a playlist
export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  try {
    const response = await api.patch(
      `${PLAYLIST_API_URL}/remove/${videoId}/${playlistId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Remove Video from Playlist Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
