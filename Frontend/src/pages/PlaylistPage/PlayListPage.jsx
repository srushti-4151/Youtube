import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPlaylistById,
  removeVideo,
} from "../../redux/slices/PlaylistSlice.js";
import { formatDuration, timeAgo } from "../../utils/timeUtils.js";
import { FaTrash, FaClock, FaList } from "react-icons/fa";
import Swal from "sweetalert2";

const PlayListPage = () => {
  const { playlistId } = useParams();
  const dispatch = useDispatch();
  const { selectedPlaylist, PisLoading } = useSelector(
    (state) => state.playlists
  );
  console.log("selectedPlaylist", selectedPlaylist);

  useEffect(() => {
    dispatch(fetchPlaylistById(playlistId));
  }, [dispatch, playlistId]);

  const handleRemove = (videoId) => {
    // Show confirmation dialog using SweetAlert
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this video from the playlist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Dispatch removeVideo action if confirmed
        dispatch(removeVideo({ playlistId, videoId }))
          .then(() => {
            // On success, fetch the updated playlist
            dispatch(fetchPlaylistById(playlistId));
            Swal.fire(
              "Deleted!",
              "The video has been removed from the playlist.",
              "success"
            );
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              "Failed to remove the video from the playlist.",
              "error"
            );
            console.error("Error removing video:", error);
          });
      }
    });
  };

  if (PisLoading)
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <>
      <div className="container mx-auto p-4">
        {selectedPlaylist ? (
          <div className="mb-8">
            <h1 className="text-3xl font-bold dark:text-white mb-2">
              {selectedPlaylist.name}
            </h1>
            <p className=" dark:text-gray-300 max-w-2xl">
              {selectedPlaylist.description}
            </p>
            <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <FaList className="mr-1" />{" "}
                {selectedPlaylist.videos?.length || 0} videos
              </span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <FaClock className="mr-1" />
                Updated{" "}
                {selectedPlaylist.updatedAt &&
                  new Date(selectedPlaylist.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <>
            <p>not found </p>
          </>
        )}

        {selectedPlaylist.videos?.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-gray-50 dark:bg-black">
            <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              This playlist is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Add videos to this playlist and they'll appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedPlaylist.videos?.map((video) => (
              <div
                key={video._id}
                className="bg-white dark:bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative">
                  <Link
                    to={`/video-page/${video._id}`}
                    className="block aspect-video"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md bg-black/80 text-white">
                      {formatDuration(video.duration)}
                    </span>
                  </Link>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <Link to={`/video-page/${video._id}`} className="flex-grow">
                      <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-white line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {video.views || 0} views • {timeAgo(video.createdAt)}
                      </p>
                    </Link>
                    <button
                      onClick={() => handleRemove(video._id)}
                      className="text-red-500 hover:text-red-700 ml-3 transition-colors"
                      title="Remove from playlist"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PlayListPage;
