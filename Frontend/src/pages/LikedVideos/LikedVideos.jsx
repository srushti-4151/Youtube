import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import VideoCard from "../../components/VideoCard.jsx";
import NoVideo from "../../components/NoVideo";
import { handleError, handleSuccess } from "../../utils/toast.js";
import { fetchLikedVideos } from "../../redux/slices/Likeslice.js";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader.jsx";

const NoLikedVideos = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-64 h-64 relative">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          {/* Soft purple background circle */}
          <circle cx="100" cy="100" r="90" fill="#F3E5FF" />

          {/* Cute broken heart (video style) */}
          <path
            d="M100 70 L80 50 C60 70 60 100 80 120 L100 140 L120 120 C140 100 140 70 120 50 Z"
            fill="#E1BEE7"
            stroke="#9C27B0"
            strokeWidth="3"
          />
          <circle cx="95" cy="95" r="5" fill="#4A148C" />

          {/* Sad face */}
          <circle cx="85" cy="80" r="5" fill="#4A148C" />
          <circle cx="115" cy="80" r="5" fill="#4A148C" />
          <path
            d="M85 110 Q100 120 115 110"
            stroke="#4A148C"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Film reel details */}
          <circle
            cx="70"
            cy="70"
            r="8"
            fill="#BA68C8"
            stroke="#7B1FA2"
            strokeWidth="2"
          />
          <circle
            cx="130"
            cy="70"
            r="8"
            fill="#BA68C8"
            stroke="#7B1FA2"
            strokeWidth="2"
          />
        </svg>
        {/* <div className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl">
          ?
        </div> */}
      </div>
      <h2 className="text-xl font-bold text-gray-700">No Liked Videos Yet</h2>
      <p className="text-gray-500 text-center max-w-md">
        Videos you like will appear here. Start exploring and like some videos!
      </p>
      <Link
        to="/"
        className="mt-4 px-6 py-2 bg-[#BA68C8] text-white rounded-3xl hover:bg-[#a45cb1] transition-colors"
      >
        Explore Videos
      </Link>
    </div>
  );
};

const LikedVideos = () => {
  const dispatch = useDispatch();
  const { likeVideos, isvideosLoading } = useSelector((state) => state.like);
  console.log("liked videos", likeVideos);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLikedVideos());
  }, []);

  return (
    <>
      <div className="w-full p-4 pb-16">
        <h1 className="text-2xl font-bold mb-4">Liked Videos</h1>

        {/* Video List */}
        {isvideosLoading ? (
          <Loader />
        ) : likeVideos?.length === 0 ? (
          <NoLikedVideos />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {likeVideos?.map((video, index) => (
              <VideoCard key={index} video={video} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LikedVideos;
