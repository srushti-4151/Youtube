import React, { useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import thumb1 from "../../assets/images/img1.jpg";
import NoVideo from "../../components/NoVideo";
import { useDispatch, useSelector } from "react-redux";
// import { getVideos } from "../../redux/slices/Videoslice";

const Home = () => {
  
  // const dispatch = useDispatch();
  // const { videos, loading } = useSelector((state) => state.videos);
  // console.log(videos)

  // useEffect(() => {
  //   dispatch(getVideos());
  // }, []);

  return (
    <div className="w-full p-4">
      {/* {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <VideoCard key={index} video={video} />
          ))}
        </div>
      ) : (
        <NoVideo />
      )} */}
    </div>
  );
};

export default Home;
