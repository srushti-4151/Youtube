import React, { useEffect, useRef, useState } from "react";
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
  editTweetComment,
  fetchTweetComments,
  removeTweetComment,
} from "../../redux/slices/TweetCommentSlice.js";
import {
  getTweetCommentLikesStatusapi,
  getTweetLikesStatusapi,
  toggleTweetCommentLikeThunk,
  toggleTweetLikeThunk,
} from "../../redux/slices/Likeslice.js";
import {
  FaRegThumbsUp,
  FaThumbsUp,
  FaRegThumbsDown,
  FaThumbsDown,
} from "react-icons/fa";
import { BsDot } from "react-icons/bs";
import { FiMoreVertical } from "react-icons/fi";
import { FaFlag } from "react-icons/fa";

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
    if (tweet?._id) {
      dispatch(getTweetLikesStatusapi(tweet._id));
    }
  }, [tweet]);

  useEffect(() => {
    comments.forEach((comment) => {
      dispatch(getTweetCommentLikesStatusapi(comment._id));
    });
  }, [dispatch, comments, tweetId]);

  const { likeStatusTweet, likeStatusTweetComments } = useSelector(
    (state) => state.like
  );
  console.log(
    " likeStatusTweetComments.......................",
    likeStatusTweetComments
  );
  const tweetLikes = likeStatusTweet[tweet._id] || {};

  // Handle comment submission
  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      handleSuccess("please loggin to comment !");
      return 
    }

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

  const handleLikeToggle = async (tweetComId, type) => {
    if (!isAuthenticated) {
      handleSuccess("Please login to like or dislike");
      return;
    }
    try {
      console.log("comment id and type", tweetComId, type);
      const togleres = await dispatch(
        toggleTweetCommentLikeThunk({ tweetComId, type })
      ).unwrap();
      if (togleres) {
        handleSuccess("like toggle");
      }
      dispatch(getTweetCommentLikesStatusapi(tweetComId)); // Refetch like status after toggling
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleTweetLikeToggle = async (tweetId, type) => {
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
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      handleError("Comment cannot be empty");
      return;
    }
  
    try {
      await dispatch(
        editTweetComment({
          tweetId: commentId, 
          updatedData: {
            content: editContent,
          },
        })
      ).unwrap();
  
      handleSuccess("Comment updated successfully");
      setEditingComment(null);
      dispatch(fetchTweetComments(tweetId));
    } catch (error) {
      handleError(error.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await dispatch(removeTweetComment(commentId)).unwrap();
      handleSuccess("Comment deleted successfully");
      dispatch(fetchTweetComments(tweetId));
    } catch (error) {
      handleError(error.message || "Failed to delete comment");
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

 useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !event.target.closest(".dropdown-button") // Prevents closing when clicking the button
    ) {
      setOpenDropdownId(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

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
      {/* Tweet Card  */}
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
                handleTweetLikeToggle(tweet._id, "like");
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
                handleTweetLikeToggle(tweet._id, "dislike");
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start space-x-3">
            {user && (
              <img
                src={user?.avatar}
                alt={user?.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
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
        {/* Comments List */}

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {commentsLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => {
              const likeStatus = likeStatusTweetComments[comment._id] || {};
              const isOwner = comment.owner?._id === user?._id;

              return (
                <div
                  key={comment._id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                >
                  <div className="flex space-x-3">
                    <img
                      src={comment.owner?.avatar}
                      alt={comment.owner?.fullName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-start">
                        <div className="flex flex-col">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {comment.owner?.fullName}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            @{comment.owner?.username}
                          </span>
                        </div>
                        <BsDot className="text-gray-400 pt-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {/* <p className="mt-1 text-gray-800 dark:text-gray-200 break-words">
                        {comment.content}
                      </p> */}
                      {editingComment === comment._id ? (
                        <div className="mt-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            rows="3"
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateComment(comment._id)}
                              className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-gray-800 dark:text-gray-200 break-words">
                          {comment.content}
                        </p>
                      )}

                      {/* Like & Dislike Section */}
                      <div className="mt-3 flex items-center space-x-2">
                        <button
                          onClick={() => handleLikeToggle(comment._id, "like")}
                          className={`flex items-center space-x-1 px-1.5 py-1 rounded-full transition-colors duration-200 ${
                            likeStatus?.isLiked
                              ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30"
                              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {likeStatus?.isLiked ? (
                            <FaThumbsUp className="text-sm" />
                          ) : (
                            <FaRegThumbsUp className="text-sm" />
                          )}
                          <span className="text-xs font-medium">
                            {likeStatus?.likesCount || 0}
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            handleLikeToggle(comment._id, "dislike")
                          }
                          className={`flex items-center space-x-1 px-1.5 py-1 rounded-full transition-colors duration-200 ${
                            likeStatus?.isDisliked
                              ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {likeStatus?.isDisliked ? (
                            <FaThumbsDown className="text-sm" />
                          ) : (
                            <FaRegThumbsDown className="text-sm" />
                          )}
                          <span className="text-xs font-medium">
                            {likeStatus?.dislikesCount || 0}
                          </span>
                        </button>
                      </div>
                    </div>
                    {/* Three dots dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === comment._id ? null : comment._id
                          );
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <FiMoreVertical />
                      </button>

                      {openDropdownId === comment._id && (
                        <div className="dropdown-button absolute right-0 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                          {isOwner ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditComment(comment);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FiEdit className="mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment._id);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FiTrash2 className="mr-2" />
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-white-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FaFlag className="mr-2" />
                              Report
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Tweetpage;
