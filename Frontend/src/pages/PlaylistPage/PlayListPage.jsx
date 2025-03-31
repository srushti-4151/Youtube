import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPlaylistById } from "../../redux/slices/PlaylistSlice.js";
import { formatDuration, timeAgo } from "../../utils/timeUtils.js";

const PlayListPage = () => {
  const { playlistId } = useParams();
  const dispatch = useDispatch();
  const { selectedPlaylist } = useSelector((state) => state.playlists);
  //   const playlist = playlists.find((p) => p._id === playlistId);
  console.log("selectedPlaylist", selectedPlaylist);

  useEffect(() => {
    dispatch(fetchPlaylistById(playlistId));
  }, [dispatch, playlistId]);

  if (!selectedPlaylist) return <p>Loading...</p>;

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedPlaylist.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            {selectedPlaylist.description}
          </p>
          <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{selectedPlaylist.videos?.length || 0} videos</span>
            <span className="mx-2">•</span>
            <span>
              Updated{" "}
              {selectedPlaylist.updatedAt &&
                new Date(selectedPlaylist.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {selectedPlaylist.videos?.map((video) => (
            <div key={video._id} className="relative aspect-video">
              <Link
                to={`/video-page/${video._id}`}
                className="relative block w-full aspect-video"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className={`w-full h-full object-cover rounded-lg absolute top-0 left-0 transition-opacity duration-500`}
                />
                <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md opacity-80 bg-black text-white">
                  {formatDuration(video.duration)}
                </span>
              </Link>
              <div className="py-3 flex">
                <div className="relative w-full flex justify-between items-start">
                  <Link
                    to={`/video-page/${video._id}`}
                    className="flex flex-col"
                  >
                    <h3 className="text-[17px] font-semibold">{video.title}</h3>
                    <p className="text-[13px] dark:text-gray-300 text-gray-700">
                      {video.views || 0} views • {timeAgo(video.createdAt)}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PlayListPage;
