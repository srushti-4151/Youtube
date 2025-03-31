import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  editPlaylist,
  fetchUserPlaylists,
  removePlaylist,
} from "../../redux/slices/PlaylistSlice.js";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../../utils/timeUtils.js";
import { FiMoreVertical } from "react-icons/fi";
import { handleSuccess } from "../../utils/toast.js";
import { useForm } from "react-hook-form";

const PlaylistSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { userPlaylists, isLoading } = useSelector((state) => state.playlists);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("userpaylist:", userPlaylists);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserPlaylists(user._id));
    }
  }, [dispatch, user?._id]);

  // Memoized playlists for performance optimization
  const playlists = useMemo(() => userPlaylists || [], [userPlaylists]);

  // Handle playlist click
  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleDelete = (playlistId, e) => {
    e.stopPropagation();
    console.log("Delete function triggered for:", playlistId);
    dispatch(removePlaylist(playlistId))
      .then(() => {
        handleSuccess("Playlist deleted");
        setShowDropdown(false);
      })
      .catch((error) => {
        console.error("Error deleting playlist:", error);
      });
  };

  const [editingPlaylist, setEditingPlaylist] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm();

  useEffect(() => {
    if (editingPlaylist) {
      setValue("name", editingPlaylist.name);
      setValue("description", editingPlaylist.description || "");
    }
  }, [editingPlaylist, setValue]);

  const onSubmit = async (data) => {
    try {
      await dispatch(
        editPlaylist({
          playlistId: editingPlaylist._id,
          updates: data,
        })
      ).unwrap();
      onClose();
      handleSuccess("Playlist edited")
      setShowDropdown(false);
      dispatch(fetchUserPlaylists(user._id)); // Refresh playlists
    } catch (error) {
      console.error("Failed to update playlist:", error);
    }
  };

  const onClose = () => {
    setEditingPlaylist(null);
    reset();
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Your Playlists
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((playlist) => {
            const firstVideoThumbnail = playlist.videos?.[0]?.thumbnail;

            return (
              <div
                key={playlist._id}
                className="relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handlePlaylistClick(playlist._id)}
              >
                {/* Thumbnail Image */}
                <img
                  src={firstVideoThumbnail}
                  alt={playlist.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Blur Overlay with Playlist Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-center p-7 md:p-5 opacity-100 transition-opacity duration-300">
                  <div className="relative backdrop-blur-sm bg-black/30 p-3 rounded-lg flex justify-between items-start">
                    <div className="flex flex-col jusify-center items-start">
                      <h3 className="text-lg font-bold text-white line-clamp-1">
                        {playlist.name}
                      </h3>
                      <span className="mt-2 text-sm text-gray-300">
                        {playlist.videos?.length || 0} Videos
                      </span>
                      <div className="text-xs text-gray-400 mt-2">
                        {timeAgo(playlist.createdAt)}
                      </div>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        className="top-2 right-2 text-white hover:bg-white/20 p-1 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents closing dropdown when clicking inside
                          setShowDropdown(
                            showDropdown === playlist._id ? null : playlist._id
                          );
                        }}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                      {/* Dropdown menu */}
                      {showDropdown === playlist._id && (
                        <div
                          className="z-30 absolute top-10 right-2 bg-gray-800 rounded-md shadow-lg w-32"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPlaylist(playlist)
                            }}
                          >
                            Edit
                          </button>
                          {console.log("Delete button is rendered")}
                          <button
                            className="w-full z-40 text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(playlist._id, e);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-64 h-64 relative">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              {/* Background circle */}
              <circle cx="100" cy="100" r="90" fill="#b7daff" />

              {/* Simple smiling face */}
              <g fill="#4B5563">
                <circle cx="80" cy="90" r="8" /> {/* Left eye */}
                <circle cx="120" cy="90" r="8" /> {/* Right eye */}
                <path
                  d="M80 130 Q100 150 120 130"
                  fill="none"
                  stroke="#4B5563"
                  strokeWidth="4"
                  strokeLinecap="round"
                />{" "}
                {/* Smile */}
              </g>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">
            No Playlists Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            Your playlists will appear here once you create them. Start
            organizing your favorite videos!
          </p>
          <Link
            to={"/"}
            className="mt-4 px-6 py-2 bg-[#1976D2] text-white rounded-3xl hover:bg-[#1565C0] transition-colors"
          >
            Create Playlist
          </Link>
        </div>
      )}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Edit Playlist
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Playlist Name
                  </label>
                  <input
                    {...register("name", {
                      required: "Name is required",
                    })}
                    id="name"
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    id="description"
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistSection;
