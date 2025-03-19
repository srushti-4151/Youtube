import React from "react";

const VideoCard = ({ video }) => {
  return (
    <div className="rounded-lg overflow-hidden transition-transform duration-300 cursor-pointer">
      {/* Thumbnail Section */}
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-44 object-cover rounded-lg"
        />

        {/* Video Duration (e.g., "8:35") */}
        <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md opacity-80">
          {video.duration}
        </span>
      </div>

      {/* Video Info */}
      <div className="py-3 flex">
        {/* Channel Avatar */}
        <img
          src={video.channelAvatar}
          alt={video.channelName}
          className="w-10 h-10 rounded-full mr-3"
        />

        <div className="flex flex-col">
          <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
          <p className="text-xs text-gray-400">{video.channelName}</p>
          <p className="text-xs text-gray-400">
            {video.views} • {video.time} ago
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
