import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPlaylists, addVideo, removeVideo, createPlaylist } from "../redux/slices/PlaylistSlice";
import { useForm } from "react-hook-form";

const PlaylistModal = ({ videoId, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userPlaylists, isLoading, isCreating } = useSelector((state) => state.playlists);
  const { register, handleSubmit, reset } = useForm();

  // Local state for selected playlists
  const [selectedPlaylists, setSelectedPlaylists] = useState({});

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserPlaylists(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    // Initialize selectedPlaylists state
    const initialSelection = {};
    userPlaylists.forEach((playlist) => {
      initialSelection[playlist._id] = playlist.videos?.some((vid) => vid._id === videoId);
    });
    setSelectedPlaylists(initialSelection);
  }, [userPlaylists, videoId]);

  // Handle checkbox toggle (only updates local state)
  const handleToggle = (playlistId) => {
    setSelectedPlaylists((prev) => ({
      ...prev,
      [playlistId]: !prev[playlistId],
    }));
  };

  // Save changes to backend
  const handleSave = () => {
    userPlaylists.forEach((playlist) => {
      const isCurrentlyInPlaylist = playlist.videos?.some((vid) => vid._id === videoId);
      const shouldBeInPlaylist = selectedPlaylists[playlist._id];

      if (!isCurrentlyInPlaylist && shouldBeInPlaylist) {
        dispatch(addVideo({ playlistId: playlist._id, videoId }));
      } else if (isCurrentlyInPlaylist && !shouldBeInPlaylist) {
        dispatch(removeVideo({ playlistId: playlist._id, videoId }));
      }
    });

    onClose(); // Close modal after saving
  };

  // Create new playlist
  const onSubmit = (data) => {
    dispatch(createPlaylist({ name: data.name, description: data.description }))
      .unwrap()
      .then(() => {
        if (user?._id) {
          dispatch(fetchUserPlaylists(user._id));
        }
        reset();
      })
      .catch((error) => console.error("Error creating playlist:", error));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Save to Playlist</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Create Playlist Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
          <div className="space-y-3">
            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="Enter playlist name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <input
              {...register("description", { required: true })}
              type="text"
              placeholder="Add description"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              {isCreating ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>

        {/* User Playlists */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Your Playlists</h3>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : userPlaylists?.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
            {userPlaylists.map((playlist) => (
              <li key={playlist._id} className="py-3 flex items-center justify-between">
                <span className="text-gray-800 dark:text-gray-200 font-medium">{playlist.name}</span>
                <label className="px-2 inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlaylists[playlist._id] || false}
                    onChange={() => handleToggle(playlist._id)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
                
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-4 text-gray-600 dark:text-gray-400">No playlists found</p>
        )}

        {/* Save & Cancel Buttons */}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
