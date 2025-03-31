import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWatchHistory } from "../../redux/slices/ViewSlice.js";
import { Link } from "react-router-dom";
import { FaHistory } from "react-icons/fa";

const History = () => {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector((state) => state.views);
  const { isAuthenticated } = useSelector((state) => state.auth); // User authentication state

  console.log("hs", history)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWatchHistory());
    }
  }, [isAuthenticated]);

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

  // Render watch history
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaHistory className="text-blue-500" />
        Watch History
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow"
          >
            <Link to={`/video/${item.video._id}`}>
              <img
                src={item.video.thumbnail}
                alt={item.video.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">
                  {item.video.title}
                </h3>
                {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Watched on: {new Date(item.watchedAt).toLocaleDateString()}
                </p> */}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
