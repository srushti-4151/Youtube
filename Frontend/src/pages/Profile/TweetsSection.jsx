import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  addTweet,
  editTweet,
  fetchUserTweets,
  removeTweet,
} from "../../redux/slices/TweetSlice.js";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FiEdit,
  FiTrash2,
  FiSend,
  FiImage,
  FiHeart,
  FiMessageCircle,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import ImageCropper from "../../utils/ImageCropper.jsx";
import { handleError, handleSuccess } from "../../utils/toast.js";
import Swal from "sweetalert2";
import { IoHeartDislikeOutline } from "react-icons/io5";
import { IoHeartDislikeSharp } from "react-icons/io5";
import {
  getTweetLikesStatusapi,
  toggleTweetLikeThunk,
} from "../../redux/slices/Likeslice.js";

const TweetsSection = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const { userId, isProfileOwner } = outletContext || {
    userId: user._id,
    isProfileOwner: false,
  };

  const dispatch = useDispatch();
  const { tweets, tweetsLoading, error } = useSelector((state) => state.tweets);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { register, handleSubmit, reset, watch } = useForm();

  const [editMode, setEditMode] = useState(false); // Track if edit mode is active
  const [tweetToEdit, setTweetToEdit] = useState(null); // Track which tweet is being edited
  const [content, setContent] = useState(""); // Store the edited content

  const selectedFile = watch("post");

  // State for image cropping
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  useEffect(() => {
    dispatch(fetchUserTweets(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (tweets?.length > 0) {
      tweets.forEach((tweet) => {
        dispatch(getTweetLikesStatusapi(tweet._id));
      });
    }
  }, [tweets]);

  const { likeStatusTweet } = useSelector((state) => state.like);
  console.log("likeStatusTweet.......................", likeStatusTweet);

  const handleLikeToggle = async (tweetId, type) => {
    console.log("tweet is in handle", tweetId,type)
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

  const onSubmit = (data) => {
    if (!data.content.trim() && !croppedImage) return;

    const formData = new FormData();
    formData.append("content", data.content);

    // If we have a cropped image, use that instead of the original file
    if (croppedImage) {
      fetch(croppedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });
          formData.append("post", file);
          dispatch(addTweet(formData))
            .unwrap()
            .then(() => {
              handleSuccess("Tweet created successfully!");
              reset();
              setCroppedImage(null);
            })
            .catch(() => handleError("Failed to create tweet"));
        });
    } else {
      if (data.post?.[0]) formData.append("post", data.post[0]);
      dispatch(addTweet(formData))
        .unwrap()
        .then(() => {
          handleSuccess("Tweet created successfully!");
          reset();
        })
        .catch(() => handleError("Failed to create tweet"));
    }
  };

  const handleUpdate = () => {
    if (!content.trim()) return; // Prevent empty updates

    dispatch(editTweet({ tweetId: tweetToEdit, content }))
      .unwrap()
      .then(() => {
        handleSuccess("Tweet updated successfully!");
      })
      .catch(() => {
        handleError("Failed to update tweet");
      });

    setEditMode(false);
    setTweetToEdit(null);
  };

  const handleDelete = async (tweetId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this tweet?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(removeTweet(tweetId)).unwrap();
          handleSuccess("Tweet deleted successfully!");
        } catch (error) {
          handleError("Failed to delete tweet");
        }
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show cropper for new images
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage) => {
    setCroppedImage(croppedImage);
    setShowCropper(false);
  };

  return (
    <div className="container mx-auto py-6 px-2 max-w-xl">
      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          cropType="tweet"
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropper(false)}
        />
      )}

      {/* Tweet Composer - Card Style */}
      {isProfileOwner && (
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

            {/* Image Upload Preview - Only shows after cropping */}
            {croppedImage && (
              <div className="p-2 relative flex justify-center items-center rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={croppedImage}
                  alt="Preview"
                  className="w-80 h-80 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCroppedImage(null)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                >
                  <FiTrash2 />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => setShowCropper(true)}
                  className="flex items-center group"
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                    <FiImage
                      size={20}
                      className="text-blue-500 dark:text-blue-400"
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    Add photo
                  </span>
                </button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <button
                type="submit"
                disabled={tweetsLoading || (!watch("content") && !croppedImage)}
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
      )}

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
              Nothing to show yet.
            </p>
          </div>
        ) : (
          tweets?.map((tweet) => {
            const tweetLikeStatus = likeStatusTweet?.[tweet._id] || {
              isLiked: false,
              isDisliked: false,
              likesCount: 0,
              dislikesCount: 0
            };
            return (
            <div
              key={tweet._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/30 border border-gray-300 dark:border-gray-600 overflow-hidden transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-700/50"
            >
              {/* Tweet Header with User Info */}
              <div className="p-4 flex items-start space-x-3 border-b border-gray-300 dark:border-gray-700">
                <img
                  src={tweet.owner.avatar}
                  alt={tweet.owner.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">
                    {tweet.owner.fullName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{tweet.owner.username}
                  </p>
                </div>
                <div className="text-sm pt-1 text-gray-600 dark:text-gray-500">
                  {new Date(tweet.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Tweet Content */}
              <div className="p-5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tweet/${tweet._id}`)} 
              }
              >
                {tweet.content && (
                  <>
                    {/* Tweet Content (Editable) */}
                    {editMode && tweetToEdit === tweet._id ? (
                      <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-100 mb-4 whitespace-pre-line">
                        {tweet.content}
                      </p>
                    )}
                  </>
                )}

                {/* Tweet Image */}
                {tweet.post && (
                  <div className="mb-4 flex justify-center items-center p-2 rounded-lg overflow-hidden">
                    <img
                      src={tweet.post}
                      alt="Tweet"
                      className="w-96 h-96 object-cover"
                    />
                  </div>
                )}
                {editMode && tweetToEdit === tweet._id && (
                  <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(tweet._id)}
                    }
                    className="m-2 px-3 py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
                  >
                    Save
                  </button>
                </>
                )}

                {/* Tweet Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleLikeToggle(tweet._id, "like")
                    }
                    }
                      className={`flex items-center space-x-1 transition-colors ${
                        tweetLikeStatus.isLiked
                          ? "text-pink-600 dark:text-pink-500"
                          : "text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"
                      }`}
                    >
                      {tweetLikeStatus.isLiked ? (
                        <FaHeart size={20} />
                      ) : (
                        <FiHeart size={20} />
                      )}
                      <span className="text-sm">{tweetLikeStatus.likesCount}</span>
                    </button>

                    <button
                    onClick={(e) =>{
                      e.stopPropagation(); 
                      handleLikeToggle(tweet._id, "dislike")
                    }
                    }
                      className={`flex items-center space-x-1 transition-colors ${
                        tweetLikeStatus.isDisliked
                          ? "text-pink-600 dark:text-pink-500"
                          : "text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500"
                      }`}
                    >
                      {tweetLikeStatus.isDisliked ? (
                        <IoHeartDislikeSharp size={20} />
                      ) : (
                        <IoHeartDislikeOutline size={20} />
                      )}
                      <span className="text-sm">{tweetLikeStatus.dislikesCount}</span>
                    </button>

                    <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       navigate(`/tweet/${tweet._id}`)} 
                     }
                    className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      <FiMessageCircle size={20} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isProfileOwner && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditMode(true);
                            setTweetToEdit(tweet._id);
                            setContent(tweet.content);
                          }}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          onClick={(e) => 
                          {
                            e.stopPropagation();
                            handleDelete(tweet._id)}
                          }
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        ) 
        )}
      </div>
    </div>
  );
};

export default TweetsSection;
