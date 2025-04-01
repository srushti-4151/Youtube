import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { timeAgo, formatDuration } from "../utils/timeUtils.js";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { handleError, handleSuccess } from "../utils/toast.js";
import {
  deleteVideo,
  fetchUserVideos,
  updateVideo,
} from "../redux/slices/Videoslice.js";
import Swal from "sweetalert2";
import PlaylistModal from "./PlaylistModal.jsx";
import { addWatchLater } from "../redux/slices/watchLaterSlice.js";

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const videoRef = useRef(null);
  const optionsRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isMyContentPage = location.pathname === "/my-content";
  const isOwner = user?._id === video.owner._id;

  const { isLoading, isUpdating, isDeleting, error } = useSelector(
    (state) => state.videos
  );
  const { isAuthenticated } = useSelector((state) => state.auth)
  // console.log("error",error)

  const [showOptions, setShowOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: video.title,
      description: video.description,
    },
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Always append all fields that might change
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
  
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
  
      const result = await dispatch(
        updateVideo({ 
          videoId: video._id,
          formData  // Changed from updateData to formData
        })
      ).unwrap();
  
      if (result) {
        handleSuccess("Video updated successfully");
        dispatch(fetchUserVideos(user._id));
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }
      
      setShowModal(false);
      setShowOptions(false);
      
    } catch (error) {
      handleError(error.message || "Failed to update video");
      console.error("Update error:", error);
    }
  };

  // Preload video when component mounts
  // Add this somewhere in your app's initialization
  useEffect(() => {
    const handleFirstInteraction = () => {
      // This satisfies browser autoplay policies
      document.removeEventListener("click", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setTimeout(() => setShowOptions(false), 200);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this video?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // console.log(video._id);
          const response = await dispatch(deleteVideo(video._id)).unwrap();
          
          if (response) {
            Swal.fire("Deleted!", "Your video has been deleted.", "success");
          }
  
          dispatch(fetchUserVideos(user._id)); // Refresh user videos
          // console.log("Video deleted successfully");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the video.", "error");
          console.error("Failed to delete video:", error);
        }
      }
    });
  };
  

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setIsHovered(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoLoaded(true))
          .catch((err) => {
            console.error("Playback failed:", err);
            setIsVideoLoaded(false);
          });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleAddToWatchlater = async () => {
    if(!isAuthenticated){
      handleSuccess("Please login");
      return
    }
    try {
      // console.log(video._id);
      const response = await dispatch(addWatchLater(video._id)).unwrap();
      
      if (response) {
        handleSuccess("added to watchlater")
      }

    } catch (error) {
      console.error("Failed to added to watchlater:", error);
    }
  }

  return (
    <div
      className="rounded-lg overflow-visible transition-transform duration-300 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Video */}
      <Link
        to={`/video-page/${video._id}`}
        className="relative block w-full aspect-video"
      >
        {/* Always render both thumbnail and video for smoother transitions */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover rounded-lg absolute top-0 left-0 transition-opacity duration-500 ${
            isHovered && isVideoLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        <video
          ref={videoRef}
          src={video.videoFile}
          className={`w-full h-full object-cover rounded-lg absolute top-0 left-0 transition-opacity duration-500 ${
            isHovered && isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          muted
          loop
          playsInline
          preload="auto" // Changed from "metadata" to "auto" for better preloading
          disablePictureInPicture
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => {
            console.error("Video load error");
            setIsVideoLoaded(false);
          }}
        />
        {/* Loading indicator */}
        {!isVideoLoaded && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {/* Video Duration - Only shows when NOT hovered or video NOT loaded */}
        {(!isHovered || !isVideoLoaded) && (
          <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md opacity-80 bg-black text-white">
            {formatDuration(video.duration)}
          </span>
        )}
      </Link>

      {/* Video Info */}
      <div className="py-3 flex">
        <Link to={`/profile/${video.owner.username}`} className="block">
          <img
            src={video.owner.avatar}
            alt={video.channelName}
            className="w-10 h-10 rounded-full mr-3"
          />
        </Link>
        <div className="relative w-full flex justify-between items-start">
          <Link to={`/video-page/${video._id}`} className="flex flex-col">
            <h3 className="text-[17px] font-semibold">{video.title}</h3>
            <p className="text-[15px] dark:text-gray-300 text-gray-700">
              {video.owner.fullName}
            </p>
            <p className="text-[13px] dark:text-gray-300 text-gray-700">
              {video.views} views • {timeAgo(video.createdAt)}
            </p>
          </Link>

          {/* Options Button */}
          <button
            className="px-2 py-2 rounded-md"
            onClick={() => setShowOptions(!showOptions)}
          >
            <BsThreeDotsVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          {showOptions && (
            <div
              ref={optionsRef}
              className="absolute text-sm z-50 top-2 right-5 dark:bg-gray-800 dark:text-white bg-gray-400 text-black rounded-lg shadow-md p-2"
            >
              <button 
              onClick={handleAddToWatchlater}
              className="block w-full text-left px-2 py-2 hover:bg-gray-700">
                Watch Later
              </button>
              <button 
              onClick={
                () => {
                  if(!isAuthenticated){
                    handleSuccess("Please Login")
                    return
                  }
                  setShowPlaylistModal(true)}
                }
              className="block w-full text-left px-2 py-2 hover:bg-gray-700">
                Add to Playlist
              </button>
              {showPlaylistModal && <PlaylistModal videoId={video._id} onClose={() => setShowPlaylistModal(false)} />}

              {isMyContentPage && isOwner && (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="block w-full text-left px-2 py-2 hover:bg-gray-700"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="block w-full text-left px-2 py-2 text-red-400 hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Update Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Video Details</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Title Field */}
              <div className="mb-4">
                <label htmlFor="title" className="block mb-2 font-medium">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title", {
                    maxLength: {
                      value: 100,
                      message: "Title should not exceed 100 characters",
                    },
                  })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder={video.title}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="mb-4">
                <label htmlFor="description" className="block mb-2 font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description", {
                    maxLength: {
                      value: 500,
                      message: "Description should not exceed 500 characters",
                    },
                  })}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder={video.description}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div className="mb-4">
                <label className="block mb-2 font-medium">Thumbnail</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-16 rounded-md overflow-hidden">
                    <img
                      src={thumbnailPreview || video.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                      Change
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                  {thumbnailFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      className="text-red-500 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Max 2MB (JPEG/PNG)</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isUpdating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUpdating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
