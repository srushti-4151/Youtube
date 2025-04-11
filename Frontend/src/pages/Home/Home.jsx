import React, { useEffect, useRef, useState } from "react";
import VideoCard from "../../components/VideoCard";
import thumb1 from "../../assets/images/img1.jpg";
import NoVideo from "../../components/NoVideo";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVideos } from "../../redux/slices/Videoslice";
import Loader from "../../components/Loader";
import { fetchAllTweets } from "../../redux/slices/TweetSlice";
import TweetCard from "../../components/TweetCard";

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
      {!videos || videos.length === 0 ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {/* {videos.map((video, index) => (
            <VideoCard key={index} video={video} />
          ))} */}
          {content.map((item, index) =>
            item.videoFile ? (
              <VideoCard key={index} video={item} />
            ) : (
              <TweetCard key={index} tweet={item} />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

