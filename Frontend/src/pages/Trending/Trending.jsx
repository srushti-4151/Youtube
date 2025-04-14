import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../../api/AuthApi.js";
import { useSelector } from "react-redux";
import VideoCard from "../../components/VideoCard.jsx";
import Loader from "../../components/Loader.jsx";

const Trending = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?._id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const RECM_BASE_URL =
      import.meta.env.MODE === "development"
        ? "http://localhost:8000/api/v1/recommendation"
        : "https://youtube-ydae.onrender.com/api/v1/recommendation";

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${RECM_BASE_URL}/recommended-videos`, {
          params: { userId },
        });
        setVideos(res.data);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [userId]);

  if (loading) {
    return <Loader />;
  }

  if (!userId) {
    return (
      <div className="w-full p-4 text-center">
        <h2 className="text-xl font-semibold">
          Please sign in to view personalized recommendations
        </h2>
        <p className="text-gray-600 mt-2">
          Our AI-powered recommendation system will suggest videos based on your
          viewing history and preferences once you're logged in.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
      {videos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">
            We don't have enough data to generate recommendations yet. Start
            watching some videos and we'll suggest similar content!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((item, index) => (
            <VideoCard key={index} video={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Trending;
