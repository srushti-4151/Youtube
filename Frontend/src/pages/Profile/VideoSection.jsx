import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVideosOfUser, fetchUserVideos, uploadVideo } from "../../redux/slices/Videoslice.js";
import VideoCard from "../../components/VideoCard.jsx";
import NoVideo from "../../components/NoVideo";
import { handleError, handleSuccess } from "../../utils/toast.js";
import { FiUpload } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";

const VideoSection = () => {
  const { userId } = useOutletContext();
  console.log("User ID:", userId);

  const dispatch = useDispatch();
  const { userAllVideos, isLoading, isUploading } = useSelector(
    (state) => state.videos
  );
  console.log("userAllVideos",userAllVideos)

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllVideosOfUser(userId));
    }
  }, [userId]);

  return (
    <>
      <div className="w-full p-4 pb-16">
        {/* Video List */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen dark:bg-black bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : userAllVideos?.length === 0 ? (
          <NoVideo />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {userAllVideos?.map((video, index) => (
              <VideoCard key={index} video={video} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default VideoSection;
