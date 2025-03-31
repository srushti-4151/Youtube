import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserVideos, uploadVideo } from "../../redux/slices/Videoslice.js";
import VideoCard from "../../components/VideoCard.jsx";
import NoVideo from "../../components/NoVideo";
import { handleError, handleSuccess } from "../../utils/toast.js";
import { FiUpload } from "react-icons/fi";

const MyContent = () => {
  const dispatch = useDispatch();
  const { userVideos, isLoading, isUploading } = useSelector(
    (state) => state.videos
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null,
  });

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserVideos(user._id));
    }
  }, [user?._id]);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setVideoData({ ...videoData, [e.target.name]: e.target.files[0] });
    } else {
      setVideoData({ ...videoData, [e.target.name]: e.target.value });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // 1. Validate inputs first
    if (!videoData.title.trim()) {
      handleError("Please enter a video title");
      return;
    }

    if (!videoData.videoFile) {
      handleError("Please select a video file");
      return;
    }

    if (!videoData.thumbnail) {
      handleError("Please select a thumbnail");
      return;
    }

    // 2. Create ONE FormData instance
    const formData = new FormData();
    formData.append("title", videoData.title);
    formData.append("description", videoData.description || ""); // Optional field
    formData.append("videoFile", videoData.videoFile);
    formData.append("thumbnail", videoData.thumbnail);

    // 3. Debug before sending
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      // 4. Dispatch the upload
      const result = await dispatch(uploadVideo(formData));

      // 5. Handle result
      if (result.error) {
        handleError(result.error.message || "Upload failed");
      } else {
        handleSuccess("Video uploaded successfully!");
        setShowModal(false);
        setVideoData({
          title: "",
          description: "",
          videoFile: null,
          thumbnail: null,
        });
        dispatch(fetchUserVideos(user._id));
      }
    } catch (error) {
      handleError(error.message || "Failed to upload video");
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="w-full p-4 pb-16">
      <h1 className="text-lg font-bold mb-4">My Videos</h1>

      <button
        onClick={() => {
          if (!isAuthenticated) {
            handleSuccess("Please login");
            return;
          }
          setShowModal(true);
        }}
        className={`
        relative px-5 py-2.5 mb-5 rounded-full font-medium bg-gradient-to-r from-[#EC7FA9] to-[#9161df]
        hover:from-[#cc5f8e] hover:to-[#7547ff] text-black 
        transition-all duration-300 ease-out transform hover:-translate-y-0.5
        group overflow-hidden
      `}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <FiUpload className="text-lg" /> {/* Using Feather icon for upload */}
          Upload Video
        </span>
      </button>

      {/* Video List */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen dark:bg-black bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      ) : userVideos?.length === 0 ? (
        <NoVideo />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {userVideos?.map((video, index) => (
            <VideoCard key={index} video={video} />
          ))}
        </div>
      )}

      {/* Modal for Upload */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Upload Video</h2>
            <form onSubmit={handleUpload} className="flex flex-col space-y-3">
              <input
                type="text"
                name="title"
                placeholder="Video Title"
                value={videoData.title}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={videoData.description}
                onChange={handleChange}
                className="border p-2 rounded"
              ></textarea>
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
      {showModal && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Upload Video
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Video Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter video title"
                  value={videoData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter video description"
                  value={videoData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Select Video
                </label>
                <input
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Thumbnail</label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>

              {/* Uploading Indicator */}
              {isUploading && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                  Uploading, please wait...
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContent;
