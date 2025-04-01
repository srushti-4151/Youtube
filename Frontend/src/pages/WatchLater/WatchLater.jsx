import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWatchLater,
  removeWatchLater,
} from "../../redux/slices/watchLaterSlice.js";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa"; // Optional: For remove button
import { Link } from "react-router-dom";

const WatchLater = () => {
  const dispatch = useDispatch();
  const { watchLater, fetchLoading, removeLoading, error } = useSelector(
    (state) => state.watchLater
  );

  useEffect(() => {
    dispatch(fetchWatchLater());
  }, [dispatch]);

  const handleRemove = (videoId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this video from Watch Later?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeWatchLater(videoId))
          .then(() => {
            Swal.fire(
              "Removed!",
              "The video has been removed from Watch Later.",
              "success"
            );
          })
          .catch((err) => {
            Swal.fire("Error!", "Failed to remove video.", "error");
            console.error("Failed to remove video from Watch Later:", err);
          });
      }
    });
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center py-6">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Watch Later
          {watchLater.length > 0 && (
            <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
              {watchLater.length} {watchLater.length === 1 ? "video" : "videos"}
            </span>
          )}
        </h1>
      </div>

      {watchLater.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your watch later is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Videos you save to watch later will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchLater.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative">
                <img
                  src={item?.video?.thumbnail}
                  alt={item?.video?.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <button
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors duration-200"
                    onClick={() => handleRemove(item.video._id)}
                    disabled={removeLoading}
                  >
                    {removeLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Removing...
                      </>
                    ) : (
                      <>
                        <FaTrashAlt className="inline-block mr-2" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-white line-clamp-2">
                  {item?.video?.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item?.video?.channelName}
                </p>
                <div className="mt-3 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{/* You can add video duration here */}</span>
                  <Link
                    to={`/video-page/${item?.video?._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    Watch now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater;
