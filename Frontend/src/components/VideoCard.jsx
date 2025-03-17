import React from "react";

const VideoCard = ({ video }) => {
  return (
    <div className="bg-slate-600 text-black overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
      {/* Thumbnail */}
      <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />

      {/* Video Info */}
      <div className="p-3 flex">
        {/* Channel Avatar */}
        <img src={video.channelAvatar} alt={video.channelName} className="w-10 h-10 rounded-full mr-3" />

        <div>
          <h3 className="text-sm font-semibold truncate">{video.title}</h3>
          <p className="text-xs text-gray-400">{video.views} • {video.time} ago</p>
          <p className="text-xs text-gray-500">{video.channelName}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
