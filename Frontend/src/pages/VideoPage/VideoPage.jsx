import React, { useEffect, useRef, useState } from "react";
import { RiShareForwardLine } from "react-icons/ri";
import { BiLike, BiDislike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { HiDownload } from "react-icons/hi";
import { FaCircleCheck } from "react-icons/fa6";
import { LuBellRing } from "react-icons/lu";
import { FaEllipsisH } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GoBell, GoThumbsup } from "react-icons/go";
import img from "../../assets/images/img1.jpg";
import vid1 from "../../assets/images/video1.mp4";
import { LiaThumbsUpSolid, LiaThumbsDownSolid } from "react-icons/lia";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchVideoById } from "../../redux/slices/Videoslice";
import { fetchUserChannelProfile } from "../../redux/slices/Authslice";
import { timeAgo } from "../../utils/timeUtils";
import {
  createComment,
  fetchVideoComments,
  removeComment,
  editComment,
} from "../../redux/slices/CommentSlice.js";
import { handleError, handleSuccess } from "../../utils/toast.js";
import { FaEdit, FaTrash, FaFlag } from "react-icons/fa";
import {
  checkIsSubscribed,
  toggleUserSubscription,
} from "../../redux/slices/Subscriptionslice.js";
import {
  getCommentLikesStatusapi,
  getVideoLikesStatusapi,
  toggleCommentLikeThunk,
  toggleLike,
} from "../../redux/slices/Likeslice.js";
import RecommendedVideos from "../../components/RecommendedVideos.jsx";
import { countView } from "../../api/viewsApi.js";
// import { addHistory } from "../../redux/slices/ViewSlice.js";

const VideoPage = () => {
  const { id } = useParams(); // Get video ID from URL
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [IsShowmoreDes, setIsShowmoreDes] = useState(false);
  const [IsShowmoreCom, setIsShowmoreCom] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const timeout = setTimeout(() => {
      console.log("Adding to watch history:", id); 
      countView(id); // Call API after delay
      // dispatch(addHistory(id));
    }, 5000); // Wait 5 seconds before counting view

    return () => clearTimeout(timeout); // Cleanup on unmount

  }, [id]);  

  const { comments } = useSelector((state) => state.comments);
  const { selectedVideo, isLoading, error } = useSelector(
    (state) => state.videos
  );
  const { userChannelProfile } = useSelector((state) => state.auth);
  // console.log("commets", comments);
  // console.log("selectedVideo", selectedVideo);
  // console.log("userChannelProfile", userChannelProfile);

  // Fetch comments when the video loads
  useEffect(() => {
    dispatch(fetchVideoComments(id));
  }, [id, dispatch]);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isAuthenticated && selectedVideo?.owner?.username) {
      dispatch(checkIsSubscribed(selectedVideo.owner.username));
    }
  }, [isAuthenticated, selectedVideo, dispatch]);

  const { isSubscribed } = useSelector((state) => state.subscriptions);

  // Handle comment submission
  const handleAddComment = async () => {
    if(!isAuthenticated) {
      handleSuccess("please login to comment");
      return;
    }
    if (!comment.trim()) return;

    const newComment = {
      content: comment.trim(), // Change "text" to "content"
    };

    try {
      // await dispatch(createComment({ videoId, commentData: newComment }));
      const result = await dispatch(
        createComment({ videoId: id, commentData: newComment })
      );
      if (result) {
        handleSuccess("comment Added successfully!");
      }
      setComment(""); // Clear input after success
      setIsFocused(false);
      dispatch(fetchVideoComments(id));
    } catch (error) {
      handleError("error adding comment");
      console.error("Failed to add comment:", error);
    }
  };

  useEffect(() => {
    dispatch(fetchVideoById(id));
  }, [id, dispatch]);

  // Fetch channel profile when video is loaded
  useEffect(() => {
    if (selectedVideo?.owner?.username) {
      dispatch(fetchUserChannelProfile(selectedVideo.owner.username));
    }
  }, [selectedVideo, isSubscribed]);

  useEffect(() => {
    if (comments?.comments) {
      setIsShowmoreCom(Array(comments.comments.length).fill(false));
    }
  }, [comments]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable background scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling when modal closes
    }
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleDeleteComment = async (commentId) => {
    try {
      const result1 = await dispatch(removeComment(commentId));
      if (result1) {
        handleSuccess("comment deleted successfully!");
      }
      setOpenMenuIndex(null);
      dispatch(fetchVideoComments(id));
    } catch (error) {
      handleError("Failed to delete comment");
      console.error("Failed to delete comment:", error);
    }
  };

  const handleInputChange = (e) => {
    setComment(e.target.value);
    e.target.style.height = "auto"; // Reset height
    e.target.style.height = e.target.scrollHeight + "px"; // Set new height
  };

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");

  const handleEditComment = async (commentId, currentContent) => {
    console.log("Editing Comment Content:", currentContent);

    if (editingCommentId === commentId) {
      try {
        const result = await dispatch(
          editComment({ commentId, updatedData: { content: editedComment } }) // Ensure updatedData is an object
        );
        if (result.payload) {
          handleSuccess("Comment updated successfully!");
        }
        setEditingCommentId(null);
        setEditedComment("");
        dispatch(fetchVideoComments(id));
      } catch (error) {
        handleError("Failed to update comment");
        console.error("Failed to update comment:", error);
      }
    } else {
      setEditingCommentId(commentId);
      setEditedComment(currentContent);
    }
  };
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px"; // Set new height
    }
  }, [editedComment]);

  const handleLike = async () => {
    try {
      const res = await dispatch(
        toggleLike({ videoId: id, type: "like" })
      ).unwrap();
      // console.log("handle eeeee Like API Response:", res);
      if (res && res.message) {
        handleSuccess(res.message);
      } else {
        handleSuccess("Liked video");
      }
      dispatch(getVideoLikesStatusapi(id));
    } catch (error) {
      handleError("Failed to liked video");
      console.error("Failed to liked video:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const res = await dispatch(
        toggleLike({ videoId: id, type: "dislike" })
      ).unwrap();
      // console.log("handle eeeee disLike API Response:", res);
      if (res && res.message) {
        console.log(res);
        handleSuccess(res.message);
      } else {
        handleSuccess("DisLiked video");
      }
      dispatch(getVideoLikesStatusapi(id));
    } catch (error) {
      handleError("Failed to dislike video");
      console.error("Failed to dislike video:", error);
    }
  };

  const { likeStatus, likeStatusComments } = useSelector((state) => state.like);
  // console.log("likeStatus.......................", likeStatus);
  console.log("likeStatusComments.......................", likeStatusComments);

  useEffect(() => {
    dispatch(getVideoLikesStatusapi(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (comments?.comments?.length > 0) {
      comments.comments.forEach((comment) => {
        dispatch(getCommentLikesStatusapi(comment._id));
      });
    }
  }, [comments?.comments]);

  const handleLikeToggle = async (commentId, type) => {
    if(!isAuthenticated){
      handleSuccess("Please login to like or dislike")
      return;
    }
    try {
      console.log("comment id and type", commentId, type);
      const togleres = await dispatch(
        toggleCommentLikeThunk({ commentId, type })
      ).unwrap();
      if (togleres) {
        handleSuccess("like toggle");
      }
      dispatch(getCommentLikesStatusapi(commentId)); // Refetch like status after toggling
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-black bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-black bg-white">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
      {selectedVideo && userChannelProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-h-screen dark:bg-black dark:text-white bg-white text-black p-4">
          {/* Left Section: Main Video Player */}
          <div className="lg:col-span-2">
            {/* videopart */}
            <div className="w-full h-64 lg:h-auto rounded-lg overflow-hidden">
              {selectedVideo ? (
                <div className="relative">
                  <video
                    src={selectedVideo?.videoFile}
                    controls
                    autoPlay
                    className="w-full rounded-lg dark:shadow-custom dark:shadow-neutral-900 aspect-video"
                  ></video>
                </div>
              ) : (
                <div className="h-64 lg:h-auto bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <button className="bg-white p-4 rounded-full">▶</button>
                </div>
              )}
            </div>
            <p className="mt-4 text-base font-semibold sm:text-lg md:text-xl line-clamp-1">
              {selectedVideo.title}
            </p>

            <div className="flex flex-col items-start justify-between gap-4 mt-4 lg:flex-row">
              <div className="flex items-start gap-3 lg:w-1/2 xl:w-2/3 sm:w-auto">
                <Link
                  // href={`/user/${video?.data?.owner.userName}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={userChannelProfile.avatar}
                    alt="imgg here"
                    className="object-cover object-center rounded-full size-10 sm:size-12"
                    loading="lazy"
                  />
                </Link>
                <div className="flex items-center justify-between w-full xl:flex-col xl:items-start">
                  <div className="flex-grow min-w-0 max-w-[70%] md:max-w-full">
                    <span className="flex items-center gap-2">
                      <Link
                        // href={`/user/${video?.data?.owner.userName}`}
                        className="truncate"
                      >
                        <h1 className="text-sm truncate sm:text-base">
                          {selectedVideo?.owner.fullName}
                        </h1>
                      </Link>
                      <FaCircleCheck size={16} />
                    </span>
                    <p className="text-sm text-gray-500 sm:text-base">
                      {userChannelProfile.subscribersCount}
                      <span className="text-sm ml-1">subscribers</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        handleSuccess("Please log in to subscribe!");
                        return;
                      }
                      dispatch(
                        toggleUserSubscription(selectedVideo?.owner?._id)
                      );
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-3xl mt-2 w-max self-start flex-shrink-0 ml-2 xl:ml-0
                      ${
                        isAuthenticated && isSubscribed
                          ? "text-gray-100 dark:bg-gray-700 bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-600"
                          : "dark:text-gray-900 dark:bg-gray-200 bg-gray-600 text-white hover:bg-gray-500 dark:hover:bg-gray-300"
                      }`}
                    // disabled={isTogglingSubscription}
                  >
                    {isAuthenticated && isSubscribed ? (
                      <LuBellRing size={20} />
                    ) : (
                      <GoBell size={20} />
                    )}
                    <span>
                      {isAuthenticated && isSubscribed
                        ? "Subscribed"
                        : "Subscribe"}
                    </span>
                  </button>
                </div>
              </div>

              {/*like dislike share download*/}
              <div className="flex flex-wrap text-gray-200 items-center justify-start gap-2 full sm:gap-3 lg:flex-nowrap lg:w-1/2 xl:w-1/3 lg:justify-end">
                <div className="flex items-center bg-[#31302f] rounded-full">
                  {isAuthenticated && likeStatus && (
                    <>
                      <button
                        className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-r-none px-2 sm:px-3 text-xs sm:text-sm"
                        onClick={handleLike}
                      >
                        {likeStatus.isLiked ? (
                          <BiSolidLike size={20} />
                        ) : (
                          <BiLike size={20} />
                        )}
                        <p>{likeStatus.likesCount}</p>
                      </button>

                      <div className="border-l border-gray-300 h-5 bg-[#31302f]" />

                      <button
                        onClick={handleDislike}
                        className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-l-none px-2 py-2 text-xs sm:text-sm sm:px-3"
                      >
                        {likeStatus.isDisliked ? (
                          <BiSolidDislike size={20} />
                        ) : (
                          <BiDislike size={20} />
                        )}
                        <p>{likeStatus.dislikesCount}</p>
                      </button>
                    </>
                  )}
                  {!isAuthenticated && likeStatus && (
                    <>
                      <button
                        className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-r-none px-2 sm:px-3 text-xs sm:text-sm"
                        onClick={() => {
                          handleSuccess("Please log in to like!");
                          return;
                        }}
                      >
                        <BiLike size={20} />
                        <p>{likeStatus.likesCount}</p>
                      </button>

                      <div className="border-l border-gray-300 h-5 bg-[#31302f]" />

                      <button
                        onClick={() => {
                          handleSuccess("Please log in to dislike!");
                          return;
                        }}
                        className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-l-none px-2 py-2 text-xs sm:text-sm sm:px-3"
                      >
                        <BiDislike size={20} />
                        <p>{likeStatus.dislikesCount}</p>
                      </button>
                    </>
                  )}
                </div>

                <button className="bg-[#31302f] text-gray-200 flex gap-1 items-center justify-center rounded-full px-2 py-2 sm:px-3 text-xs sm:text-sm">
                  <RiShareForwardLine size={24} />
                  <p className="hidden sm:inline">Share</p>
                </button>
                <button className="bg-[#31302f] flex gap-1 items-center rounded-full justify-center px-2 py-2 sm:px-3 text-xs sm:text-sm">
                  <HiDownload size={24} />
                  <p className="hidden sm:inline">Download</p>
                </button>

                {/* <button variant="dark" size="icon" className="rounded-full">
                <FaEllipsisH />
              </button> */}
              </div>
            </div>

            {/* Details */}
            <div>
              {/* description */}
              <div className="shadow-lg bg-[#F2F2F2] text-black p-4 my-4 rounded-md text-md dark:bg-[#202021] dark:text-gray-300">
                <p>
                  {/* {VIEW_FORMATTER.format(video?.data?.views)} views &nbsp;
                {formatTimeAgo(new Date(video?.data?.createdAt))} */}
                  {selectedVideo.views} views &nbsp;{" "}
                  {timeAgo(selectedVideo.createdAt)}
                </p>
                <p className="mt-3 leading-relaxed">
                  {/* {IsShowmoreDes ? description : shortDescription} */}
                  {IsShowmoreDes
                    ? selectedVideo.description
                    : selectedVideo.description.slice(0, 150) + "..."}
                  <span
                    className="text-gray-400 font-semibold cursor-pointer ml-1 hover:underline"
                    onClick={() => setIsShowmoreDes(!IsShowmoreDes)}
                  >
                    {IsShowmoreDes ? " Show less" : " more"}
                  </span>
                </p>
              </div>

              {/* Comment section */}
              <div className="mt-7 p-4 rounded-2xl overflow-x-hidden">
                <h2 className="text-lg font-semibold mb-2">
                  {comments.totalComments} Comments
                </h2>

                {/* my comment part */}
                <div className="my-3">
                  <div className="flex items-center space-x-3 p-2">
                    {/* User Avatar */}
                    <img
                       src={user?.avatar || img}
                      alt="User Avatar"
                      className="w-12 h-12 rounded-full"
                    />

                    {/* Comment Input Box */}
                    <div className="relative w-full">
                      <textarea
                        value={comment}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => !comment && setIsFocused(false)}
                        placeholder="Add a comment..."
                        className="w-full bg-transparent dark:text-white text-black text-sm border-b-2 focus:border-b-2 focus:border-gray-100 focus:outline-none pb-1 pr-12 resize-none overflow-hidden"
                        rows="1"
                      />
                    </div>
                  </div>

                  {/* Buttons (Shown only when input is focused) */}
                  {isFocused && (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setComment("");
                          setIsFocused(false);
                        }}
                        className="text-gray-400 hover:bg-[#3F3F3F] hover:text-white px-3 py-2 rounded-2xl text-sm font-semibold transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddComment}
                        disabled={!comment.trim() || isLoading}
                        className={`px-3 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                          comment.trim()
                            ? "bg-[#65B8FF] hover:bg-[#5295cf] text-black"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                      >
                        {isLoading ? "Posting..." : "Comment"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments Section (Scrollable) */}
                <div className="max-h-80 overflow-y-auto pr-2">
                  {comments?.comments?.length > 0 ? (
                    comments.comments.map((comment, index) => {
                      const shortComment =
                        comment.content.slice(0, 100) + "...";
                        const commentLikeStatus = likeStatusComments[comment._id] || {
                          isLiked: false,
                          isDisliked: false,
                          likesCount: 0,
                          dislikesCount: 0
                        };
                      return (
                        <div
                          key={index}
                          className="flex justify-between px-2 py-4"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={comment.owner.avatar}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <p>
                                <span className="text-[16px]">
                                  {comment.owner.fullName}
                                </span>
                                <span className="ml-2 text-[16px] text-gray-400">
                                  {timeAgo(comment.createdAt)}
                                </span>
                              </p>
                              <p className="text-[15px]">
                                @{comment.owner.username}
                              </p>

                              {editingCommentId === comment._id ? (
                                <div className="flex flex-col text-[16px] mt-2 w-[500px] overflow-auto">
                                  <textarea
                                    ref={textareaRef}
                                    value={editedComment}
                                    onChange={(e) =>
                                      setEditedComment(e.target.value)
                                    }
                                    className="w-full bg-transparent dark:text-white text-black border-b-2 focus:border-b-2 focus:border-gray-100 focus:outline-none pb-1 pr-12 resize-none overflow-hidden"
                                    // rows="auto"
                                    // autoFocus
                                  />
                                  <div className="flex justify-end gap-3 mt-2">
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="text-gray-400 hover:bg-[#3F3F3F] hover:text-white px-3 py-1 rounded-2xl font-semibold transition-all duration-200"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleEditComment(
                                          comment._id,
                                          comment.content
                                        )
                                      }
                                      disabled={!editedComment.trim()}
                                      className={`px-3 py-1 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                                        editedComment.trim()
                                          ? "bg-[#65B8FF] hover:bg-[#5295cf] text-black"
                                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                      }`}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="max-w-[500px] text-[16px] mt-2 break-words whitespace-normal">
                                  {IsShowmoreCom[index]
                                    ? comment.content
                                    : shortComment}
                                  {comment.content.length > 100 && (
                                    <span
                                      className="text-gray-400 text-[14px] font-semibold cursor-pointer ml-1 hover:underline"
                                      onClick={() => {
                                        setIsShowmoreCom((prev) =>
                                          prev.map((val, i) =>
                                            i === index ? !val : val
                                          )
                                        );
                                      }}
                                    >
                                      {IsShowmoreCom[index]
                                        ? "Show Less"
                                        : "Show More"}
                                    </span>
                                  )}
                                </p>
                              )}

                                <div className="flex mt-2">
                                  <button
                                    onClick={() =>
                                      handleLikeToggle(comment._id, "like")
                                    }
                                    className="flex gap-1"
                                  >
                                    {commentLikeStatus.isLiked ? (
                                      <BiSolidLike size={20} />
                                    ) : (
                                      <BiLike size={20} />
                                    )}
                                    <p>{commentLikeStatus.likesCount}</p>
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleLikeToggle(comment._id, "dislike")
                                    }
                                    className="ml-5 flex gap-1"
                                  >
                                    {commentLikeStatus.isDisliked ? (
                                      <BiSolidDislike size={20} />
                                    ) : (
                                      <BiDislike size={20} />
                                    )}
                                    <p>{commentLikeStatus.dislikesCount}</p>
                                  </button>

                                  <button className="pl-4 text-sm">
                                    Reply
                                  </button>
                                </div>
                            </div>
                          </div>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenuIndex(
                                  openMenuIndex === index ? null : index
                                )
                              }
                              className="rounded-full"
                            >
                              <BsThreeDotsVertical />
                            </button>

                            {/* Dropdown Menu */}
                            {openMenuIndex === index && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 mt-2 w-28 dark:text-white text-black shadow-lg rounded-lg p-2 z-10"
                              >
                                {isAuthenticated && comment.owner._id === user?._id ? (
                                  <>
                                <button
                                  className="flex items-center w-full text-left px-2 py-2 dark:hover:bg-gray-800 hover:bg-gray-300 rounded-md"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditedComment(comment.content);
                                    setOpenMenuIndex(null);
                                  }}
                                >
                                  <FaEdit className="mr-2" /> Edit
                                </button>
                                <button
                                  className="flex items-center w-full text-left px-2 py-2 dark:hover:bg-gray-800 hover:bg-gray-300 rounded-md text-red-400"
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                >
                                  <FaTrash className="mr-2" /> Delete
                                </button>
                                  </>
                                ) : (
                                  <button
                                  className="flex items-center w-full text-left px-2 py-2 dark:hover:bg-gray-800 hover:bg-gray-300 rounded-md"
                                  
                                >
                                  <FaFlag className="mr-2" /> Report
                                </button>
                                )} 
                                  
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p> No comments... </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Suggested Videos */}
          <div className="lg:col-span-1 p-2">
            <h3 className="text-lg font-bold mb-4">Suggested Videos</h3>
            <RecommendedVideos  currentVideoId={id} />
          </div>

          {/* Modal */}
          {isOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <div className="bg-black text-white p-6 rounded-lg w-96">
                {/* Modal Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Save To Playlist</h2>
                  <button onClick={() => setIsOpen(false)} className="text-xl">
                    ✖
                  </button>
                </div>

                {/* Playlist Options */}
                <div className="mt-4 space-y-2">
                  {[
                    "Beat MODE",
                    "Ill Lyricist",
                    "HYPEBEAST",
                    "Good Vibes",
                    "Rap Caviar",
                  ].map((playlist, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-500"
                      />
                      <span>{playlist}</span>
                    </label>
                  ))}
                </div>

                {/* Input Field */}
                <div className="mt-4">
                  <label className="text-sm">Name</label>
                  <input
                    type="text"
                    placeholder="Enter playlist name"
                    className="w-full p-2 mt-1 bg-gray-800 rounded-md text-white"
                  />
                </div>

                {/* Create Button */}
                <button className="mt-4 w-full bg-purple-500 py-2 rounded-md">
                  Create new Playlist
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VideoPage;

// import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import { RiShareForwardLine } from "react-icons/ri";
// import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";
// import { HiDownload } from "react-icons/hi";
// import { FaCircleCheck } from "react-icons/fa6";
// import { LuBellRing } from "react-icons/lu";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { GoBell } from "react-icons/go";
// import { LiaThumbsUpSolid, LiaThumbsDownSolid } from "react-icons/lia";
// import { Link, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchVideoById } from "../../redux/slices/Videoslice";
// import { fetchUserChannelProfile } from "../../redux/slices/Authslice";
// import { timeAgo } from "../../utils/timeUtils";
// import {
//   createComment,
//   fetchVideoComments,
//   removeComment,
//   editComment,
// } from "../../redux/slices/CommentSlice.js";
// import { handleError, handleSuccess } from "../../utils/toast.js";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { checkIsSubscribed, toggleUserSubscription } from "../../redux/slices/Subscriptionslice.js";

// // Extracted Comment Component for better performance
// const CommentItem = React.memo(({
//   comment,
//   index,
//   openMenuIndex,
//   setOpenMenuIndex,
//   handleEditComment,
//   handleDeleteComment,
//   editingCommentId,
//   editedComment,
//   setEditedComment,
//   isShowMore,
//   toggleShowMore
// }) => {
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
//     }
//   }, [editedComment]);

//   const shortComment = comment.content.slice(0, 100) + "...";

//   return (
//     <div className="flex justify-between px-2 py-4" key={comment._id}>
//       <div className="flex items-start gap-3">
//         <img
//           src={comment.owner.avatar}
//           alt="Avatar"
//           className="w-12 h-12 rounded-full"
//         />
//         <div>
//           <p>
//             <span className="text-[16px]">{comment.owner.fullName}</span>
//             <span className="ml-2 text-[16px] text-gray-400">
//               {timeAgo(comment.createdAt)}
//             </span>
//           </p>
//           <p className="text-[15px]">@{comment.owner.username}</p>

//           {editingCommentId === comment._id ? (
//             <div className="flex flex-col text-[16px] mt-2 w-[500px] overflow-auto">
//               <textarea
//                 ref={textareaRef}
//                 value={editedComment}
//                 onChange={(e) => setEditedComment(e.target.value)}
//                 className="w-full bg-transparent dark:text-white text-black border-b-2 focus:border-b-2 focus:border-gray-100 focus:outline-none pb-1 pr-12 resize-none overflow-hidden"
//               />
//               <div className="flex justify-end gap-3 mt-2">
//                 <button
//                   // onClick={() => setEditingCommentId(null)}
//                   onClick={() => setEditedComment({
//                     ...commentState,
//                     editingId: null
//                   })}
//                   className="text-gray-400 hover:bg-[#3F3F3F] hover:text-white px-3 py-1 rounded-2xl font-semibold transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleEditComment(comment._id, comment.content)}
//                   disabled={!editedComment.trim()}
//                   className={`px-3 py-1 rounded-2xl text-sm font-semibold transition-all duration-200 ${
//                     editedComment.trim()
//                       ? "bg-[#65B8FF] hover:bg-[#5295cf] text-black"
//                       : "bg-gray-600 text-gray-400 cursor-not-allowed"
//                   }`}
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <p className="max-w-[500px] text-[16px] mt-2 break-words whitespace-normal">
//               {isShowMore ? comment.content : shortComment}
//               {comment.content.length > 100 && (
//                 <span
//                   className="text-gray-400 text-[14px] font-semibold cursor-pointer ml-1 hover:underline"
//                   onClick={() => toggleShowMore(index)}
//                 >
//                   {isShowMore ? "Show Less" : "Show More"}
//                 </span>
//               )}
//             </p>
//           )}

//           <div className="flex mt-2">
//             <button>
//               <LiaThumbsUpSolid size={20} />
//             </button>
//             <span className="text-[14px] text-gray-400">
//               {comment.likesCount}
//             </span>

//             <button className="ml-5">
//               <LiaThumbsDownSolid size={20} />
//             </button>

//             <button className="pl-4 text-sm">Reply</button>
//           </div>
//         </div>
//       </div>
//       <div className="relative">
//         <button
//           onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
//           className="rounded-full"
//         >
//           <BsThreeDotsVertical />
//         </button>
//         {openMenuIndex === index && (
//           <div
//             className="absolute right-0 mt-2 w-28 bg-black text-white shadow-lg rounded-lg p-2 z-10"
//           >
//             <button
//               className="flex items-center w-full text-left px-2 py-2 hover:bg-gray-800 rounded-md"
//               onClick={() => {
//                 setEditingCommentId(comment._id);
//                 setEditedComment(comment.content);
//                 setOpenMenuIndex(null);
//               }}
//             >
//               <FaEdit className="mr-2" /> Edit
//             </button>
//             <button
//               className="flex items-center w-full text-left px-2 py-2 hover:bg-gray-800 rounded-md text-red-400"
//               onClick={() => handleDeleteComment(comment._id)}
//             >
//               <FaTrash className="mr-2" /> Delete
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });

// const VideoPage = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const menuRef = useRef(null);

//   // Combined comment state
//   const [commentState, setCommentState] = useState({
//     text: "",
//     isFocused: false,
//     editingId: null,
//     editedText: ""
//   });

//   // UI state
//   const [uiState, setUiState] = useState({
//     showDescription: false,
//     showComments: [],
//     isModalOpen: false,
//     openMenuIndex: null
//   });

//   // Redux state
//   const { comments } = useSelector((state) => state.comments);
//   const { selectedVideo, isLoading, error } = useSelector((state) => state.videos);
//   const { userChannelProfile, isAuthenticated } = useSelector((state) => state.auth);
//   const { isSubscribed } = useSelector((state) => state.subscriptions);

//   // Memoized derived data
//   const formattedVideoData = useMemo(() => ({
//     views: `${selectedVideo?.views} views`,
//     uploadTime: timeAgo(selectedVideo?.createdAt),
//     shortDescription: selectedVideo?.description?.slice(0, 150) + "...",
//     fullDescription: selectedVideo?.description || ""
//   }), [selectedVideo]);

//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setUiState(prev => ({ ...prev, openMenuIndex: null }));
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Initial data fetching
//   useEffect(() => {
//     dispatch(fetchVideoById(id));
//     dispatch(fetchVideoComments(id));
//   }, [id, dispatch]);

//   // Check subscription status
//   useEffect(() => {
//     if (isAuthenticated && selectedVideo?.owner?.username) {
//       dispatch(checkIsSubscribed(selectedVideo.owner.username));
//     }
//   }, [isAuthenticated, selectedVideo, dispatch]);

//   // Fetch channel profile
//   useEffect(() => {
//     if (selectedVideo?.owner?.username) {
//       dispatch(fetchUserChannelProfile(selectedVideo.owner.username));
//     }
//   }, [selectedVideo, dispatch, isSubscribed]);

//   // Initialize show more comments array
//   useEffect(() => {
//     if (comments?.comments) {
//       setUiState(prev => ({
//         ...prev,
//         showComments: Array(comments.comments.length).fill(false)
//       }));
//     }
//   }, [comments]);

//   // Handle scroll locking when modal is open
//   useEffect(() => {
//     document.body.style.overflow = uiState.isModalOpen ? "hidden" : "auto";
//     return () => { document.body.style.overflow = "auto"; };
//   }, [uiState.isModalOpen]);

//   // Comment handlers
//   const handleAddComment = useCallback(async () => {
//     if (!commentState.text.trim()) return;

//     try {
//       const result = await dispatch(
//         createComment({
//           videoId: id,
//           commentData: { content: commentState.text.trim() }
//         })
//       );

//       if (result) {
//         handleSuccess("Comment added successfully!");
//         setCommentState(prev => ({ ...prev, text: "", isFocused: false }));
//         dispatch(fetchVideoComments(id));
//       }
//     } catch (error) {
//       handleError("Error adding comment");
//       console.error("Failed to add comment:", error);
//     }
//   }, [commentState.text, dispatch, id]);

//   const handleDeleteComment = useCallback(async (commentId) => {
//     try {
//       const result = await dispatch(removeComment(commentId));
//       if (result) {
//         handleSuccess("Comment deleted successfully!");
//         setUiState(prev => ({ ...prev, openMenuIndex: null }));
//         dispatch(fetchVideoComments(id));
//       }
//     } catch (error) {
//       handleError("Failed to delete comment");
//       console.error("Failed to delete comment:", error);
//     }
//   }, [dispatch, id]);

//   const handleEditComment = useCallback(async (commentId, currentContent) => {
//     if (commentState.editingId === commentId) {
//       try {
//         const result = await dispatch(
//           editComment({
//             commentId,
//             updatedData: { content: commentState.editedText }
//           })
//         );

//         if (result.payload) {
//           handleSuccess("Comment updated successfully!");
//           setCommentState(prev => ({
//             ...prev,
//             editingId: null,
//             editedText: ""
//           }));
//           dispatch(fetchVideoComments(id));
//         }
//       } catch (error) {
//         handleError("Failed to update comment");
//         console.error("Failed to update comment:", error);
//       }
//     } else {
//       setCommentState(prev => ({
//         ...prev,
//         editingId: commentId,
//         editedText: currentContent
//       }));
//     }
//   }, [commentState.editingId, commentState.editedText, dispatch, id]);

//   const handleSubscribe = useCallback(() => {
//     if (!isAuthenticated) {
//       handleSuccess("Please log in to subscribe!");
//       return;
//     }
//     dispatch(toggleUserSubscription(selectedVideo?.owner?._id));
//   }, [isAuthenticated, selectedVideo, dispatch]);

//   const toggleShowMore = useCallback((index) => {
//     setUiState(prev => ({
//       ...prev,
//       showComments: prev.showComments.map((val, i) =>
//         i === index ? !val : val
//       )
//     }));
//   }, []);

//   //   // Dummy suggested videos data
//   const suggestedVideos = [
//     {
//       channlename: "channelname",
//       title: "How does a browser work?",
//       views: "100K Views",
//       time: "18 hours ago",
//       thumbnail: "thumb1.jpg",
//     },
//     {
//       channlename: "channelname",
//       title: "Building a multi-million dollar app",
//       views: "120K Views",
//       time: "20 hours ago",
//       thumbnail: "thumb2.jpg",
//     },
//     {
//       channlename: "channelname",
//       title: "Google and Pieces dropped updates",
//       views: "90K Views",
//       time: "15 hours ago",
//       thumbnail: "thumb3.jpg",
//     },
//     {
//       channlename: "channelname",
//       title: "How database works | Engineering",
//       views: "80K Views",
//       time: "10 hours ago",
//       thumbnail: "thumb4.jpg",
//     },
//   ];

//   // Loading and error states
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen dark:bg-black bg-white">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen dark:bg-black bg-white">
//         <p className="text-red-500 text-lg">{error}</p>
//       </div>
//     );
//   }

//   if (!selectedVideo || !userChannelProfile) return null;

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-h-screen dark:bg-black dark:text-white bg-white text-black p-4">
//       {/* Left Section: Main Video Player */}
//       <div className="lg:col-span-2">
//         {/* Video Player */}
//         <div className="w-full rounded-lg overflow-hidden">
//           <video
//             src={selectedVideo?.videoFile}
//             controls
//             autoPlay
//             className="w-full rounded-lg dark:shadow-custom dark:shadow-neutral-900 aspect-video"
//           />
//         </div>

//         {/* Video Info */}
//         <h1 className="mt-4 text-base font-semibold sm:text-lg md:text-xl line-clamp-1">
//           {selectedVideo.title}
//         </h1>

//         {/* Channel Info and Actions */}
//         <div className="flex flex-col items-start justify-between gap-4 mt-4 lg:flex-row">
//           <div className="flex items-start gap-3 lg:w-1/2 xl:w-2/3 sm:w-auto">
//             <Link to={`/user/${selectedVideo?.owner?.username}`} className="flex-shrink-0">
//               <img
//                 src={userChannelProfile.avatar}
//                 alt="Channel avatar"
//                 className="object-cover object-center rounded-full size-10 sm:size-12"
//                 loading="lazy"
//               />
//             </Link>

//             <div className="flex items-center justify-between w-full xl:flex-col xl:items-start">
//               <div className="flex-grow min-w-0 max-w-[70%] md:max-w-full">
//                 <span className="flex items-center gap-2">
//                   <Link
//                     to={`/user/${selectedVideo?.owner?.username}`}
//                     className="truncate"
//                   >
//                     <h1 className="text-sm truncate sm:text-base">
//                       {selectedVideo?.owner.fullName}
//                     </h1>
//                   </Link>
//                   <FaCircleCheck size={16} />
//                 </span>
//                 <p className="text-sm text-gray-500 sm:text-base">
//                   {userChannelProfile.subscribersCount}
//                   <span className="text-sm ml-1">subscribers</span>
//                 </p>
//               </div>

//               <button
//                 onClick={handleSubscribe}
//                 className={`flex items-center gap-2 px-3 py-2 text-sm rounded-3xl mt-2 w-max self-start flex-shrink-0 ml-2 xl:ml-0
//                   ${
//                     isAuthenticated && isSubscribed
//                       ? "text-gray-100 dark:bg-gray-700 bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-600"
//                       : "dark:text-gray-900 dark:bg-gray-200 bg-gray-600 text-white hover:bg-gray-500 dark:hover:bg-gray-300"
//                   }`}
//               >
//                 {isAuthenticated && isSubscribed ? (
//                   <LuBellRing size={20} />
//                 ) : (
//                   <GoBell size={20} />
//                 )}
//                 <span>
//                   {isAuthenticated && isSubscribed
//                     ? "Subscribed"
//                     : "Subscribe"}
//                 </span>
//               </button>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap text-gray-200 items-center justify-start gap-2 full sm:gap-3 lg:flex-nowrap lg:w-1/2 xl:w-1/3 lg:justify-end">
//             <div className="flex items-center bg-[#31302f] rounded-full">
//               <button
//                 className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-r-none px-2 sm:px-3 text-xs sm:text-sm"
//               >
//                 {selectedVideo.isLiked ? (
//                   <BiSolidLike size={20} />
//                 ) : (
//                   <BiLike size={20} />
//                 )}
//                 <p>{selectedVideo.likesCount}</p>
//               </button>

//               <div className="border-l border-gray-300 h-5 bg-[#31302f]" />

//               <button className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-l-none px-2 py-2 sm:px-3">
//                 <BiDislike size={20} />
//               </button>
//             </div>

//             <button className="bg-[#31302f] text-gray-200 flex gap-1 items-center justify-center rounded-full px-2 py-2 sm:px-3 text-xs sm:text-sm">
//               <RiShareForwardLine size={24} />
//               <p className="hidden sm:inline">Share</p>
//             </button>

//             <button className="bg-[#31302f] flex gap-1 items-center rounded-full justify-center px-2 py-2 sm:px-3 text-xs sm:text-sm">
//               <HiDownload size={24} />
//               <p className="hidden sm:inline">Download</p>
//             </button>
//           </div>
//         </div>

//         {/* Video Description */}
//         <div className="shadow-lg bg-[#F2F2F2] text-black p-4 my-4 rounded-md text-md dark:bg-[#202021] dark:text-gray-300">
//           <p>
//             {formattedVideoData.views} • {formattedVideoData.uploadTime}
//           </p>
//           <p className="mt-3 leading-relaxed">
//             {uiState.showDescription
//               ? formattedVideoData.fullDescription
//               : formattedVideoData.shortDescription}
//             <span
//               className="text-gray-400 font-semibold cursor-pointer ml-1 hover:underline"
//               onClick={() => setUiState(prev => ({
//                 ...prev,
//                 showDescription: !prev.showDescription
//               }))}
//             >
//               {uiState.showDescription ? " Show less" : " more"}
//             </span>
//           </p>
//         </div>

//         {/* Comment Section */}
//         <div className="mt-7 p-4 rounded-2xl overflow-x-hidden">
//           <h2 className="text-lg font-semibold mb-2">
//             {comments.totalComments} Comments
//           </h2>

//           {/* Comment Input */}
//           <div className="my-3">
//             <div className="flex items-center space-x-3 p-2">
//               <img
//                 src={userChannelProfile.avatar}
//                 alt="User Avatar"
//                 className="w-12 h-12 rounded-full"
//               />

//               <div className="relative w-full">
//                 <textarea
//                   value={commentState.text}
//                   onChange={(e) => setCommentState(prev => ({
//                     ...prev,
//                     text: e.target.value
//                   }))}
//                   onFocus={() => setCommentState(prev => ({
//                     ...prev,
//                     isFocused: true
//                   }))}
//                   onBlur={() => !commentState.text && setCommentState(prev => ({
//                     ...prev,
//                     isFocused: false
//                   }))}
//                   placeholder="Add a comment..."
//                   className="w-full bg-transparent dark:text-white text-black text-sm border-b-2 focus:border-b-2 focus:border-gray-100 focus:outline-none pb-1 pr-12 resize-none overflow-hidden"
//                   rows="1"
//                 />
//               </div>
//             </div>

//             {commentState.isFocused && (
//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => setCommentState(prev => ({
//                     ...prev,
//                     text: "",
//                     isFocused: false
//                   }))}
//                   className="text-gray-400 hover:bg-[#3F3F3F] hover:text-white px-3 py-2 rounded-2xl text-sm font-semibold transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddComment}
//                   disabled={!commentState.text.trim() || isLoading}
//                   className={`px-3 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ${
//                     commentState.text.trim()
//                       ? "bg-[#65B8FF] hover:bg-[#5295cf] text-black"
//                       : "bg-gray-600 text-gray-400 cursor-not-allowed"
//                   } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
//                 >
//                   {isLoading ? "Posting..." : "Comment"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Comments List */}
//           <div className="max-h-80 overflow-y-auto pr-2">
//             {comments?.comments?.length > 0 ? (
//               comments.comments.map((comment, index) => (
//                 <CommentItem
//                   key={comment._id}
//                   comment={comment}
//                   index={index}
//                   openMenuIndex={uiState.openMenuIndex}
//                   setEditingCommentId={(value) => setCommentState(prev => ({
//                     ...prev,
//                     editingId: value
//                   }))}
//                   handleEditComment={handleEditComment}
//                   handleDeleteComment={handleDeleteComment}
//                   editingCommentId={commentState.editingId}
//                   editedComment={commentState.editedText}
//                   setEditedComment={(text) => setCommentState(prev => ({
//                     ...prev,
//                     editedText: text
//                   }))}
//                   isShowMore={uiState.showComments[index]}
//                   toggleShowMore={toggleShowMore}
//                   menuRef={menuRef}
//                 />
//               ))
//             ) : (
//               <p>No comments yet...</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Right Section: Suggested Videos */}
//       <div className="lg:col-span-1 p-2">
//         <h3 className="text-lg font-bold mb-4">Suggested Videos</h3>
//         <div className="space-y-4">
//           {suggestedVideos.map((video, index) => (
//             <div
//               key={index}
//               className="flex dark:bg-black bg-white dark:text-white text-black overflow-hidden"
//             >
//               <img
//                 src={video.thumbnail}
//                 alt="Thumbnail"
//                 className="w-40 h-24 object-cover"
//               />
//               <div className="p-2 flex flex-col justify-between">
//                 <h3 className="text-sm font-semibold leading-tight">
//                   {video.title}
//                 </h3>
//                 <p className="text-xs text-gray-400">{video.channlename}</p>
//                 <p className="text-xs text-gray-400">
//                   {video.views} • {video.time}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoPage;
