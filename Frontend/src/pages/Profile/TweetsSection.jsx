import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { addTweet, fetchUserTweets } from "../../redux/slices/TweetSlice.js";
import { useOutletContext } from "react-router-dom";
import { FiEdit, FiTrash2, FiSend, FiImage, FiHeart, FiMessageCircle } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const TweetsSection = () => {
  const outletContext = useOutletContext();
  const { userId, isProfileOwner } = outletContext || {
    userId: user._id,
    isProfileOwner: false,
  };

  const dispatch = useDispatch();
  const { tweets, tweetsLoading, error } = useSelector((state) => state.tweets);

  const { register, handleSubmit, reset, watch } = useForm();
  const selectedFile = watch("post");

  useEffect(() => {
    dispatch(fetchUserTweets(userId));
  }, [dispatch, userId]);

  const onSubmit = (data) => {
    if (!data.content.trim() && !data.post?.[0]) return;

    const formData = new FormData();
    formData.append("content", data.content);
    if (data.post?.[0]) formData.append("post", data.post[0]);

    dispatch(addTweet(formData));
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Tweet Composer - Card Style */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            Share your thoughts
          </span>
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <textarea
            {...register("content")}
            className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows="3"
            placeholder="What's on your mind?"
          />

          {/* Image Upload Preview */}
          {selectedFile?.[0] && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img 
                src={URL.createObjectURL(selectedFile[0])} 
                alt="Preview" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                <FiImage className="text-blue-500 dark:text-blue-400 text-lg" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {selectedFile?.[0]?.name || "Add photo"}
              </span>
              <input
                type="file"
                {...register("post")}
                accept="image/*"
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={tweetsLoading}
              className={`px-6 py-2 rounded-full font-medium text-white flex items-center space-x-1 ${
                tweetsLoading 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md"
              } transition-all duration-200`}
            >
              {tweetsLoading ? (
                "Posting..."
              ) : (
                <>
                  <FiSend className="text-lg" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}
      </div>

      {/* Tweets List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <span className="border-b-2 border-blue-500 pb-1">Recent Posts</span>
        </h3>

        {tweetsLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tweets.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/30">
            <p className="text-gray-500 dark:text-gray-400">
              Nothing to show yet. Create your first post!
            </p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <div
              key={tweet._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/30 overflow-hidden transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-700/50"
            >
              {/* Tweet Content */}
              <div className="p-5">
                {tweet.content && (
                  <p className="text-gray-800 dark:text-gray-100 mb-4 whitespace-pre-line">
                    {tweet.content}
                  </p>
                )}

                {/* Tweet Image */}
                {tweet.post && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <img
                      src={tweet.post}
                      alt="Tweet"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                )}

                {/* Tweet Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <FiHeart className="text-lg" />
                      <span className="text-sm">Like</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      <FiMessageCircle className="text-lg" />
                      <span className="text-sm">Comment</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <small className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(tweet.createdAt).toLocaleString()}
                    </small>
                    {isProfileOwner && (
                      <div className="flex space-x-1">
                        <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                          <FiEdit size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TweetsSection;