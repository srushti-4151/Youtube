import React, { useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import thumb1 from "../../assets/images/img1.jpg";
import NoVideo from "../../components/NoVideo";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVideos } from "../../redux/slices/Videoslice";

const Home = () => {
  
  const dispatch = useDispatch();
  const { videos = [], isLoading } = useSelector((state) => state.videos.videos || {});

  console.log("videos alll", videos)

  useEffect(() => {
    dispatch(fetchAllVideos());
  }, []);

  return (
    <div className="w-full p-4">
      {isLoading ? (
        <p>Loading videos...</p>
      ) : !videos || videos.length === 0 ? ( // Defensive check
        <NoVideo />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <VideoCard key={index} video={video} />
          ))}
        </div>
      )}
    </div>
  );
  
};

export default Home;
