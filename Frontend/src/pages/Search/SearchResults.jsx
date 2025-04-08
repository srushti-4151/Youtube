import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchSearchResults } from "../../redux/slices/searchSlice.js";
import Loader from "../../components/Loader.jsx";
import { FiUser, FiClock, FiEye } from "react-icons/fi";
import { formatDuration, timeAgo } from "../../utils/timeUtils.js";

const SearchResults = () => {
  const navigate = useNavigate();
  const { query } = useParams();
  const dispatch = useDispatch();
  const { results, loading, error } = useSelector((state) => state.search);
  console.log("results : ", results);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (query) {
      dispatch(fetchSearchResults(query));
      setInitialLoad(false);
    }
  }, [query, dispatch]);

  // Don't render anything until we have a query
  if (!query) return null;

  // Show loading state only after initial load to prevent flash
  if (initialLoad || loading) {
    return <Loader />;
  }

  if (error) {
    return <p>error</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-6">
      {/* Channels Section (Below Videos) */}
      {results?.channels?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Channels</h3>
          <div className="space-y-4">
            {results.channels.map((channel) => (
              <div
                key={channel._id}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent Link from triggering
                  navigate(`/profile/${channel.username}`);
                }}
                className="flex items-center p-3 rounded-lg cursor-pointer"
              >
                <div className="rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                  {channel.avatar ? (
                    <img
                      src={channel.avatar}
                      alt={channel.fullName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-gray-500 text-2xl" />
                  )}
                </div>
                <div className="w-full">
                  <h4 className="font-medium text-xl">{channel.fullName}</h4>
                  <p className="dark:text-gray-400 text-gray-600 text-sm mt-1">
                    {channel.subscribersCount} subscribers
                  </p>
                  <p className="dark:text-gray-400 text-gray-600 text-sm line-clamp-2">
                    {channel.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Videos Section - YouTube-like horizontal layout */}
      {results?.videos?.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Videos</h3>
          {results.videos.map((video) => (
            <div
              key={video._id}
              onClick={() => navigate(`/video-page/${video._id}`)}
              className="flex flex-col md:flex-row gap-2 md:gap-4 md:p-2 rounded-lg cursor-pointer"
            >
              {/* Thumbnail (Left) */}
              <div className="flex-shrink-0 relative w-auto h-52 md:w-96 md:h-52 bg-gray-200 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-500 
                  `}
                />
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>

              {/* Video Details (Right) */}
              <div className="flex-grow flex flex-col">
                <h4 className="font-medium text-sm md:text-lg line-clamp-2">
                  {video.title}
                </h4>
                <div className="flex items-center dark:text-gray-400 text-gray-600 text-xs md:text-sm mt-1">
                  <span>{video.views || 0} views</span>
                  <span className="mx-2">•</span>
                  <span>{timeAgo(video.createdAt)}</span>
                </div>
                <div className="flex items-center mt-1 md:mt-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent Link from triggering
                      navigate(`/profile/${video.owner.username}`);
                    }}
                    className="block"
                  >
                    <img
                      src={video.owner.avatar}
                      alt={video.channelName}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {video.owner.username || "Channel Name"}
                  </p>
                </div>
                <div className="hidden md:inline-block ">
                  <p className="text-gray-500 order-4 text-sm mt-2 line-clamp-2">
                    {video.description ||
                      "Video description goes here. This is a sample description that might be a bit longer."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!results?.videos?.length && !results?.channels?.length && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <FiUser className="text-gray-500 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-800">
            No results found
          </h3>
          <p className="text-gray-500 mt-2">
            Try different keywords or remove search filters
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
