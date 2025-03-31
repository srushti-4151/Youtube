import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVideos } from "../redux/slices/Videoslice";
import { Link } from "react-router-dom";
import { formatDuration, timeAgo } from "../utils/timeUtils";

const RecommendedVideos = ({ currentVideoId }) => {
  const dispatch = useDispatch();
  const { videos = [], isLoading } = useSelector((state) => state.videos.videos || {});

  useEffect(() => {
    // Only fetch if videos aren't already loaded
    if (videos.length === 0) {
      dispatch(fetchAllVideos());
    }
  }, [dispatch, videos.length]);

  // Filter out current video and limit to 5-10 recommendations
  const recommendedVideos = useMemo(() => {
    return videos
      .filter(video => video._id !== currentVideoId)
      .slice(0, 10);
  }, [videos, currentVideoId]);

  if (isLoading) {
    return (
        // renders 5 skeleton placeholders 
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 w-40 h-24 rounded"></div>
            <div className="p-2 flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendedVideos.map((video) => (
        <Link 
          to={`/video-page/${video._id}`} 
          key={video._id}
          className="flex dark:bg-black bg-white dark:text-white text-black overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="relative flex-shrink-0 w-[168px] h-[94px]">
            <img
              src={video.thumbnail || img} // Fallback to img if no thumbnail
              alt={video.title}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy" // Lazy load images
            />
            {video.duration && (
              <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
          <div className="px-2 flex flex-col justify-start">
            <h3 className="text-[14px] font-semibold leading-tight line-clamp-3">
              {video.title}
            </h3>
            <p className="text-[12px] text-gray-400 pt-1">{video.owner?.fullName || video.channlename}</p>
            <p className="text-[12px] text-gray-400">
              {video.views} views • {timeAgo(video.createdAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecommendedVideos;