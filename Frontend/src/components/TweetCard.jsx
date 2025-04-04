import React from "react";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { timeAgo } from "../utils/timeUtils";

const TweetCard = ({ tweet }) => {
  return (
    <div className="rounded-lg h-fit overflow-visible transition-transform duration-300 cursor-pointer hover:shadow-lg border dark:border-gray-800 border-gray-300 dark:hover:shadow-gray-700">
      {/* Tweet Info */}
      <div className="px-4 py-3 flex">
        <Link to={`/profile/${tweet.owner.username}`} className="block">
          <img
            src={tweet.owner.avatar}
            alt={tweet.owner.username}
            className="w-10 h-10 rounded-full mr-3"
          />
        </Link>
        <div className="relative w-full flex justify-between items-start">
          <Link to={`/tweet/${tweet._id}`} className="flex flex-col">
            <h3 className="text-[15px] font-semibold">
              {tweet.owner.fullName}
            </h3>
            <p className="text-[13px] dark:text-gray-400 text-gray-600">
              @{tweet.owner.username}
            </p>
            <p className="text-[13px] dark:text-gray-400 text-gray-600 mt-1">
              {timeAgo(tweet.createdAt)} • {tweet.likesCount} likes •{" "}
              {tweet.commentsCount} comments
            </p>
          </Link>
        </div>
      </div>

      {/* Tweet Content */}
      <Link to={`/tweet/${tweet._id}`} className="relative block w-full px-4 py-2">
        {/* Tweet text */}
        <div className="mb-3">
          <p className="text-[15px] dark:text-gray-200 text-gray-800 line-clamp-3 overflow-hidden text-ellipsis">
            {tweet.content}
          </p>
        </div>

        {/* Tweet image if exists */}
        {tweet.post && (
          <div className="rounded-lg overflow-hidden mb-2 flex justify-center items-center">
            <img
              src={tweet.post}
              alt="Tweet media"
              className="w-40 h-40 object-cover rounded-lg"
            />
          </div>
        )}
      </Link>
    </div>
  );
};

export default TweetCard;
