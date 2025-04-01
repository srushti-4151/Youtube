import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearWatchHistory,
  fetchWatchHistory,
  removeFromHistory,
} from "../../redux/slices/ViewSlice.js";
import { Link } from "react-router-dom";
import {
  FaHistory,
  FaTrashAlt,
  FaEye,
  FaClock,
  FaTimes,
  FaHome,
} from "react-icons/fa";
import { handleSuccess } from "../../utils/toast.js";
import Swal from "sweetalert2";

const History = () => {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector((state) => state.views);
  const { isAuthenticated } = useSelector((state) => state.auth); // User authentication state

  console.log("hs", history);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWatchHistory());
    }
  }, [isAuthenticated]);

  const handleDelete = (videoId) => {
    console.log("video id : ", videoId);
    dispatch(removeFromHistory(videoId))
      .unwrap()
      .then(() => {
        handleSuccess("Deleted");
        dispatch(fetchWatchHistory());
      })
      .catch((error) => console.error("Error deleting from history:", error));
  };

  const handleClear = () => {
     Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete History?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // console.log(video._id);
              const response = await dispatch(clearWatchHistory()).unwrap();
              
              if (response) {
                Swal.fire("Deleted!", "Your watch has been Cleared.", "success");
              }

            } catch (error) {
              Swal.fire("Error!", "Failed to clear history.", "error");
              console.error("Failed to clear history:", error);
            }
          }
        });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading history: {error}
      </div>
    );
  }

  // Handle both "User not logged in" and "No history" cases
  if (!isAuthenticated || !history || history.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          History
        </h2>

        <div className="flex flex-col items-center h-[60vh] justify-center gap-6 text-center p-6">
          <div className="relative">
            <div className="w-36 h-36 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FaHistory className="text-5xl text-blue-600 dark:text-blue-400" />
              <div className="absolute -inset-2 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isAuthenticated
                ? "Your history is empty"
                : "History is disabled"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
              {isAuthenticated
                ? "Videos you watch will appear here. Start exploring content!"
                : "Sign in to keep track of what you watch"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              to={isAuthenticated ? "/" : "/login"}
              className="mt-4 px-6 py-2 text-white rounded-3xl transition-colors bg-blue-600 hover:bg-blue-700"
            >
              {isAuthenticated ? "Watch Videos" : "sign in"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FaHistory className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Watch History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {history.length} {history.length === 1 ? "video" : "videos"}{" "}
              watched
            </p>
          </div>
        </div>

        <button
          className="px-4 py-2 bg-transparent border border-red-400 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200 flex items-center gap-2"
          onClick={handleClear}
        >
          <FaTrashAlt className="text-sm" />
          <span>Clear all history</span>
        </button>
      </div>

      {/* Video Grid */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {history.map((item, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 border border-gray-100 dark:border-gray-700"
            >
              <Link
                to={`/video-page/${item.video._id}`}
                className="block focus:outline-none rounded-xl"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video">
                  <img
                    src={item.video.thumbnail}
                    alt={item.video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay Elements */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                      <FaEye className="text-blue-400" />
                      Watched
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.video.title}
                  </h3>

                  {/* Channel Info */}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="truncate">{item.video.channelName}</span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 gap-2">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-xs opacity-70" />
                        <span>
                          {new Date(item.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation
                        e.stopPropagation(); // Stop event from bubbling up to <Link>
                        handleDelete(item.video._id);
                      }}
                      aria-label="Remove from history"
                    >
                      <FaTimes className="text-lg" />
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-5 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
            <FaHistory className="text-4xl text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
            Your watch history is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Videos you watch will appear here. Start watching videos to see them
            in your history.
          </p>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <FaHome />
            <span>Browse Videos</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default History;
