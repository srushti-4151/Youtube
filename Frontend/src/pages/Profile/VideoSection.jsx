import React from "react";
import thumb1 from "../../assets/images/img1.jpg";
import NoVideo from "../../components/NoVideo";

const VideoSection = () => {
  const videos = [
    {
      thumbnail: thumb1,
      title: "Learn React in 10 Minutes",
      views: "1M Views",
      time: "2 days",
      channelName: "Tech Guru",
      channelAvatar: thumb1,
    },
    {
      thumbnail: "thumb2.jpg",
      title: "Mastering Redux",
      views: "500K Views",
      time: "5 days",
      channelName: "Code Expert",
      channelAvatar: "avatar2.jpg",
    },
    {
      thumbnail: "thumb1.jpg",
      title: "Learn React in 10 Minutes",
      views: "1M Views",
      time: "2 days",
      channelName: "Tech Guru",
      channelAvatar: "avatar1.jpg",
    },
    {
      thumbnail: "thumb2.jpg",
      title: "Mastering Redux",
      views: "500K Views",
      time: "5 days",
      channelName: "Code Expert",
      channelAvatar: "avatar2.jpg",
    },
    {
      thumbnail: "thumb1.jpg",
      title: "Learn React in 10 Minutes",
      views: "1M Views",
      time: "2 days",
      channelName: "Tech Guru",
      channelAvatar: "avatar1.jpg",
    },
    {
      thumbnail: "thumb2.jpg",
      title: "Mastering Redux",
      views: "500K Views",
      time: "5 days",
      channelName: "Code Expert",
      channelAvatar: "avatar2.jpg",
    },
    {
      thumbnail: "thumb1.jpg",
      title: "Learn React in 10 Minutes",
      views: "1M Views",
      time: "2 days",
      channelName: "Tech Guru",
      channelAvatar: "avatar1.jpg",
    },
    {
      thumbnail: "thumb2.jpg",
      title: "Mastering Redux",
      views: "500K Views",
      time: "5 days",
      channelName: "Code Expert",
      channelAvatar: "avatar2.jpg",
    },
    {
      thumbnail: "thumb1.jpg",
      title: "Learn React in 10 Minutes",
      views: "1M Views",
      time: "2 days",
      channelName: "Tech Guru",
      channelAvatar: "avatar1.jpg",
    },
    {
      thumbnail: "thumb2.jpg",
      title: "Mastering Redux",
      views: "500K Views",
      time: "5 days",
      channelName: "Code Expert",
      channelAvatar: "avatar2.jpg",
    },
    {
      thumbnail: "thumb1.jpg",
      title: "Learn React in 10 Minutes",
      views: "1M Views",
      time: "2 days",
      channelName: "Tech Guru",
      channelAvatar: "avatar1.jpg",
    },
    {
      thumbnail: "thumb2.jpg",
      title: "Mastering Redux",
      views: "500K Views",
      time: "5 days",
      channelName: "Code Expert",
      channelAvatar: "avatar2.jpg",
    },
  ];
  return (
    <>
      <div className="w-full">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <div
                key={index}
                className="bg-slate-600 text-black overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                />

                {/* Video Info */}
                <div className="p-3 flex">
                  <div>
                    <h3 className="text-sm font-semibold truncate">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {video.views} • {video.time} ago
                    </p>
                    <p className="text-xs text-gray-500">{video.channelName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 mb-40">
            <NoVideo />
          </div>
        )}
      </div>
    </>
  );
};

export default VideoSection;
