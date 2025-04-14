import React, { useEffect, useRef, useState } from "react";
import VideoCard from "../../components/VideoCard";
import thumb1 from "../../assets/images/img1.jpg";
import NoVideo from "../../components/NoVideo";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVideos } from "../../redux/slices/Videoslice";
import Loader from "../../components/Loader";
import { fetchAllTweets } from "../../redux/slices/TweetSlice";
import TweetCard from "../../components/TweetCard";
import Trending from "../Trending/Trending";

// const shuffleArray = (array) => {
//   return array.sort(() => Math.random() - 0.5);
// };
const shuffleArray = (array) => {
  const shuffled = [...array]; // Avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
  }
  return shuffled;
};

const Home = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [content, setContent] = useState([]);
  const dispatch = useDispatch();
  const { videos = [], AllLoading } = useSelector(
    (state) => state.videos.videos || {}
  );
  const { alltweets } = useSelector((state) => state.tweets);
  const lastContentRef = useRef(null);
  // console.log("alltweets", alltweets);
  // console.log("videos alll", videos);

  useEffect(() => {
    dispatch(fetchAllVideos());
    dispatch(fetchAllTweets());
  }, []);

  // useEffect(() => {
  //   if (videos.length > 0 || alltweets.length > 0) {
  //     setContent(shuffleArray([...videos, ...alltweets])); // Merge & shuffle
  //   }
  // }, [videos, alltweets]);
  useEffect(() => {
    if (videos.length > 0 || alltweets.length > 0) {
      const newContent = shuffleArray([...videos, ...alltweets]);

      // Compare with last stored content to avoid unnecessary state updates
      if (!lastContentRef.current || lastContentRef.current !== newContent) {
        setContent(newContent);
        lastContentRef.current = newContent; // Store last shuffled content
      }
    }
  }, [videos, alltweets]);

  return (
    <div className="w-full p-4">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("All")}
          className={`px-4 py-2 rounded ${
            activeTab === "All"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("Trending")}
          className={`px-4 py-2 rounded ${
            activeTab === "Trending"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
          }`}
        >
          Trending
        </button>
      </div>
      {activeTab === "All" ? (
        !videos || videos.length === 0 ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {content.map((item, index) =>
              item.videoFile ? (
                <VideoCard key={index} video={item} />
              ) : (
                <TweetCard key={index} tweet={item} />
              )
            )}
          </div>
        )
      ) : (
        <Trending />
      )}
    </div>
  );
};

export default Home;
