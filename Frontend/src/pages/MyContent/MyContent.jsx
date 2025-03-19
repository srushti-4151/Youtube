// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUserVideos } from "../../redux/slices/Videoslice.js";
// import VideoCard from "../../components/VideoCard.jsx";
// import NoVideo from "../../components/NoVideo";

// const MyContent = () => {
//   const dispatch = useDispatch();
//   const { userVideos, isLoading } = useSelector((state) => state.videos);
//   const { user } = useSelector((state) => state.auth);

//   console.log("uservideos",userVideos)

//   useEffect(() => {
//     if (user?._id) {
//       dispatch(fetchUserVideos(user._id));
//     }
//   }, [user?._id]); 
  

//   return (
//     <div className="w-full p-4">
//       <h1 className="text-lg font-bold mb-4">My Videos</h1>

//       {isLoading ? (
//         <p>Loading videos...</p>
//       ) : userVideos?.length === 0 ? (
//         <NoVideo />
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
//           {userVideos?.map((video, index) => (
//             <VideoCard key={index} video={video} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyContent;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserVideos, uploadVideo } from "../../redux/slices/Videoslice.js";
import VideoCard from "../../components/VideoCard.jsx";
import NoVideo from "../../components/NoVideo";

const MyContent = () => {
  const dispatch = useDispatch();
  const { userVideos, isLoading } = useSelector((state) => state.videos);
  const { user } = useSelector((state) => state.auth);

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

    if (!videoData.title || !videoData.description || !videoData.videoFile || !videoData.thumbnail) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", videoData.title);
    formData.append("description", videoData.description);
    formData.append("videoFile", videoData.videoFile);
    formData.append("thumbnail", videoData.thumbnail);

    dispatch(uploadVideo(formData)); 
    setShowModal(false);
    setVideoData({ title: "", description: "", videoFile: null, thumbnail: null });
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-lg font-bold mb-4">My Videos</h1>

      {/* Upload Video Button */}
      <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload Video
      </button>

      {/* Video List */}
      {isLoading ? (
        <p>Loading videos...</p>
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
      {showModal && (
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
              <input type="file" name="videoFile" accept="video/*" onChange={handleChange} className="border p-2 rounded" />
              <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} className="border p-2 rounded" />
              <div className="flex justify-between">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Upload</button>
                <button onClick={() => setShowModal(false)} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContent;
