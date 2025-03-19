import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video on mouse leave
    }
  };

  return (
    <Link to={`/video-page/${video._id}`}>
      <div
        className="rounded-lg overflow-hidden transition-transform duration-300 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail / Video Section */}
        <div className="relative w-full h-44">
          {!isHovered ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-44 object-cover rounded-lg"
            />
          ) : (
            <video
              ref={videoRef}
              src={video.videoUrl} // Ensure `videoUrl` is in your data
              className="w-full h-44 object-cover rounded-lg"
              muted
              loop
            />
          )}

          {/* Video Duration */}
          {!isHovered && (
            <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md opacity-80 bg-black text-white">
              {video.duration}
            </span>
          )}
        </div>

        {/* Video Info */}
        <div className="py-3 flex">
          {/* Channel Avatar */}
          <img
            src={video.owner.avatar}
            alt={video.channelName}
            className="w-10 h-10 rounded-full mr-3"
          />

          <div className="flex flex-col">
            <h3 className="text-sm font-semibold line-clamp-2">
              {video.title}
            </h3>
            <p className="text-xs text-gray-400">{video.channelName}</p>
            <p className="text-xs text-gray-400">
              {video.views} • {video.createdAt} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
