import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FiHeart,
  FiMessageCircle,
  FiEdit,
  FiTrash2,
  FiSend,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { IoHeartDislikeOutline, IoHeartDislikeSharp } from "react-icons/io5";
import { handleError, handleSuccess } from "../../utils/toast.js";
import { fetchTweetById } from "../../redux/slices/TweetSlice.js";
import {
  createTweetComment,
  fetchTweetComments,
} from "../../redux/slices/TweetCommentSlice.js";
import { getTweetLikesStatusapi, toggleTweetLikeThunk } from "../../redux/slices/Likeslice.js";

const Tweetpage = () => {
  const { tweetId } = useParams();
  const dispatch = useDispatch();
  const { tweet, tweetLoading, error } = useSelector((state) => state.tweets);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { comments, ComisLoading: commentsLoading } = useSelector(
    (state) => state.tweetcomments
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  // Fetch tweet and comments
  useEffect(() => {
    if (tweetId) {
      dispatch(fetchTweetById(tweetId));
      dispatch(fetchTweetComments(tweetId));
    }
  }, [dispatch, tweetId]);

  useEffect(() => {
    dispatch(getTweetLikesStatusapi(tweet._id));
  }, [tweet]);

  const { likeStatusTweet } = useSelector((state) => state.like);
  console.log("likeStatusTweet.......................", likeStatusTweet);
  const tweetLikes = likeStatusTweet[tweet._id] || {}; 


  const handleLikeToggle = async (tweetId, type) => {
    console.log("tweet is in handle", tweetId, type);
    if (!isAuthenticated) {
      handleSuccess("Please login to like or dislike");
      return;
    }
    try {
      console.log("tweet id and type", tweetId, type);
      const togleres = await dispatch(
        toggleTweetLikeThunk({ tweetId, type })
      ).unwrap();
      if (togleres) {
        handleSuccess("like toggle");
      }
      dispatch(getTweetLikesStatusapi(tweetId)); // Refetch like status after toggling
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle comment submission
  const onSubmit = async (data) => {
    if (!data.content.trim()) return;

    try {
      const result = await dispatch(
        createTweetComment({
          tweetId,
          commentData: { content: data.content },
        })
      ).unwrap();

      if (result) {
        handleSuccess("Comment added successfully!");
        reset();
        // Refresh comments
        dispatch(fetchTweetComments(tweetId));
      }
    } catch (error) {
      handleError(error.message || "Failed to add comment");
    }
  };

  if (tweetLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    handleError(error);
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading tweet: {error}</p>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Tweet not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Tweet Card (unchanged) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Tweet Header */}
        <div className="p-4 flex items-center space-x-3 border-b border-gray-200 dark:border-gray-700">
          <img
            src={tweet.owner?.avatar}
            alt={tweet.owner?.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              {tweet.owner?.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{tweet.owner?.username}
            </p>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(tweet.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Tweet Content */}
        <div className="p-5">
          <p className="text-gray-800 dark:text-gray-100 mb-4 whitespace-pre-line">
            {tweet.content}
          </p>

          {/* Tweet Image if exists */}
          {tweet.post && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={tweet.post}
                alt="Tweet media"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          )}
        </div>

        {/* Tweet Actions */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeToggle(tweet._id, "like");
              }}
              className={`flex items-center space-x-1 transition-colors ${
                tweetLikes.isLiked
                  ? "text-pink-600 dark:text-pink-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"
              }`}
            >
              {tweetLikes.isLiked ? (
                <FaHeart size={20} />
              ) : (
                <FiHeart size={20} />
              )}
              <span className="text-sm">{tweetLikes.likesCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeToggle(tweet._id, "dislike");
              }}
              className={`flex items-center space-x-1 transition-colors ${
                tweetLikes.isDisliked
                  ? "text-pink-600 dark:text-pink-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"
              }`}
            >
              {tweetLikes.isDisliked ? (
                <IoHeartDislikeSharp size={20} />
              ) : (
                <IoHeartDislikeOutline size={20} />
              )}
              <span className="text-sm">{tweetLikes.dislikesCount}</span>
            </button>

            {/* Comment Button */}
            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
              <FiMessageCircle size={20} />
              <span>{tweet.commentsCount || 0}</span>
            </button>
          </div>

          {/* Edit/Delete Buttons (for owner) */}
          {tweet.isOwner && (
            <div className="flex space-x-2">
              <button className="text-gray-500 hover:text-blue-500">
                <FiEdit size={20} />
              </button>
              <button className="text-gray-500 hover:text-red-500">
                <FiTrash2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Comments ({tweet.commentsCount || 0})
          </h3>
        </div>

        {/* Comment Form */}
        {isAuthenticated && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start space-x-3">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 flex items-center">
                <input
                  type="text"
                  {...register("content")}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-2 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                >
                  <FiSend size={20} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {commentsLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No comments yet
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="p-4">
                <div className="flex space-x-3">
                  <img
                    src={comment.owner?.avatar}
                    alt={comment.owner?.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline space-x-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">
                        {comment.owner?.fullName}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        @{comment.owner?.username}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-800 dark:text-gray-200">
                      {comment.content}
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {/* <div className="flex space-x-2 text-xs">
                        <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500">
                          Reply
                        </button>
                        {comment.owner?._id === user?._id && (
                          <button className="text-gray-500 dark:text-gray-400 hover:text-red-500">
                            Delete
                          </button>
                        )}
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tweetpage;
