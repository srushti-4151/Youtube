import React from "react";
import VideoCard from "../../components/Videocard";
import thumb1 from "../../assets/images/img1.jpg";
import NoVideo from "../../components/NoVideo";

const Home = () => {
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
    <div className="w-full">
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <VideoCard key={index} video={video} />
          ))}
        </div>
      ) : (
        <NoVideo />
      )}
    </div>
  );
};

export default Home;
