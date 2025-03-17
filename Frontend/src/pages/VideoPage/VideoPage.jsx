import React, { useEffect, useState } from "react";
import { AiOutlineFolderAdd } from "react-icons/ai";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { GoBell, GoThumbsup } from "react-icons/go";
import img from "../../assets/images/img1.jpg";
import vid1 from "../../assets/images/video1.mp4";

const VideoPage = () => {
  // Dummy suggested videos data
  const suggestedVideos = [
    {
      channlename: "channelname",
      title: "How does a browser work?",
      views: "100K Views",
      time: "18 hours ago",
      thumbnail: "thumb1.jpg",
    },
    {
      channlename: "channelname",
      title: "Building a multi-million dollar app",
      views: "120K Views",
      time: "20 hours ago",
      thumbnail: "thumb2.jpg",
    },
    {
      channlename: "channelname",
      title: "Google and Pieces dropped updates",
      views: "90K Views",
      time: "15 hours ago",
      thumbnail: "thumb3.jpg",
    },
    {
      channlename: "channelname",
      title: "How database works | Engineering",
      views: "80K Views",
      time: "10 hours ago",
      thumbnail: "thumb4.jpg",
    },
  ];

  const [comments] = useState([
    {
      fullname: "The shubha",
      username: "theshubhagrwl",
      time: "1 year ago",
      text: `"Whenever there is a confusion, remove that" no wise words were said before`,
      likes: 36,
      avatar: img, // Replace with real avatar URL
    },
    {
      fullname: "Flick Am",
      username: "FLiCK5",
      time: "1 year ago",
      text: "Whoever watched the backend series on Chai or Code, if they want to complete the whole project they will need this series, thanx Hitesh sir for making this series.",
      likes: 17,
      avatar: img,
    },
    {
      fullname: "Raj patel",
      username: "devLearner",
      time: "2 months ago",
      text: "This tutorial series is gold! Helped me understand backend so well. Thanks a lot!",
      likes: 12,
      avatar: img,
    },
    {
      fullname: "Master Code",
      username: "codeMaster",
      time: "3 weeks ago",
      text: "Great content! Helped me crack my first job interview as a backend dev!",
      likes: 20,
      avatar: img,
    },
  ]);

  const [comment, setComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [IsShowmoreDes, setIsShowmoreDes] = useState(false);
  const description =
    "Grouping in MongoDB is a powerful feature of the MongoDB aggregation pipeline that allows users to categorize data into groups based on specific fields. This functionality is essential for performing complex operations like calculating the average of a dataset or determining the most common values within a collection. For example, to calculate the average age of users in a database, do this using the `$group` stage in aggregation... It helps in breaking down data into meaningful insights, making it highly useful for analytical queries.";
  const shortDescription = description.slice(0, 150) + "...";

  const [IsShowmoreCom, setIsShowmoreCom] = useState([]);

  useEffect(() => {
    setIsShowmoreCom(Array(comments.length).fill(false));
  }, [comments]);

  const videoData = [
    {
      // videoUrl: "https://youtu.be/L2ZlBbelFWs?si=oiKv4WhWNT3MjM5v",
      videoUrl: vid1,
    },
  ];

  const [isOpen, setIsOpen] = useState(false);
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
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-h-screen bg-black text-white p-4">
      {/* Left Section: Main Video Player */}
      <div className="lg:col-span-2">
        {/* videopart */}
        <div className="w-full h-64 lg:h-96 rounded-lg overflow-hidden">
          {videoData ? (
            <div className="relative">
              <video
                src={videoData[0]}
                controls={true}
                autoPlay
                className="w-full h-auto aspect-video rounded-lg object-contain"
              ></video>
            </div>
          ) : (
            <div className="h-64 lg:h-96 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <button className="bg-white p-4 rounded-full">▶</button>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="border border-white mt-7 p-4 rounded-2xl">
            {/* Video - Title, views, duration  */}
            <h2 className="mt-1 text-xl font-bold">
              Lex Fridman plays Red Dead Redemption 2
            </h2>
            <div className="text-sm mt-1">
              <span className="text-gray-400">109,067 Views • </span>
              <span className="text-gray-400">18 hours ago</span>
            </div>
            {/* user , buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 gap-2">
              <div className="flex items-center justify-between">
                <img
                  src={img}
                  alt="image"
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="flex flex-col justify-center text-[15px]">
                  <p>name</p>
                  <p>followers</p>
                </div>
              </div>
              <div className="flex flex-wrap md:items-center gap-3">
                <button className="bg-[#AE7AFF] text-white font-bold text-[15px] hover:bg-[#7c57b6] transition-all duration-300 px-3 py-2 flex items-center gap-2 rounded-2xl">
                  <GoBell size={20} /> <span> Subscribe </span>
                </button>
                <div className="flex items-center gap-6 px-2 py-1 border border-white rounded-lg">
                  <button className="px-1 py-1 flex items-center gap-2">
                    <FiThumbsUp className="hover:text-[#AE7AFF] text-lg transition-all duration-300" />{" "}
                    <span>10</span>
                  </button>
                  <button className="px-1 py-1 flex items-center gap-2">
                    <FiThumbsDown className="hover:text-[#AE7AFF] text-lg transition-all duration-300" />{" "}
                    <span>2</span>
                  </button>
                </div>
                <button
                  onClick={() => setIsOpen(true)}
                  className="bg-white text-black text-[15px] hover:bg-[#AE7AFF] transition-all duration-300 px-3 py-2 flex items-center gap-1 rounded-lg"
                >
                  <AiOutlineFolderAdd className="text-2xl" /> Save
                </button>
              </div>
            </div>

            {/* description */}
            <div className="bg-gray-900 text-white text-sm rounded-lg p-4 mt-5">
              <p className="mt-1 text-gray-300 leading-relaxed">
                {IsShowmoreDes ? description : shortDescription}
                <span
                  className="text-gray-400 font-semibold cursor-pointer ml-1 hover:underline"
                  onClick={() => setIsShowmoreDes(!IsShowmoreDes)}
                >
                  {IsShowmoreDes ? " Show less" : " more"}
                </span>
              </p>
            </div>
          </div>

          {/* Comment section */}
          <div className="border border-white mt-7 p-4 rounded-2xl">
            <h2 className="text-lg font-semibold mb-2">53 Comments</h2>

            {/* my comment part */}
            <div className="my-3">
              <div className="flex items-center space-x-3 p-2">
                {/* User Avatar */}
                <img
                  src={img}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />

                {/* Comment Input Box */}
                <div className="relative w-full">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => !comment && setIsFocused(false)}
                    placeholder="Add a comment..."
                    className="w-full focus:border-white bg-transparent text-white text-sm border-b border-gray-500 outline-none pb-1 pr-12"
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
                    disabled={!comment.trim()}
                    className={`px-3 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      comment.trim()
                        ? "bg-[#65B8FF] hover:bg-[#5295cf] text-black"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Comment
                  </button>
                </div>
              )}
            </div>

            {/* Comments Section (Scrollable) */}
            <div className="max-h-80 overflow-y-auto pr-2">
              {comments.map((comment, index) => {
                const shortComment = comment.text.slice(0, 100) + "...";
                return (
                  <div key={index} className="px-2 py-3 border-t">
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p>
                          <span className="text-[13px]">
                            {comment.fullname}
                          </span>
                          <span className="ml-2 text-[12px] text-gray-400">
                            {comment.time}
                          </span>
                        </p>
                        <p className="text-sm">@{comment.username}</p>

                        <p className="text-[14px] mt-2">
                          {IsShowmoreCom[index] ? comment.text : shortComment}
                          <span
                            className="text-gray-400 font-semibold cursor-pointer ml-1 hover:underline"
                            onClick={() => {
                              setIsShowmoreCom((prev) =>
                                prev.map((val, i) => (i === index ? !val : val))
                              );                              
                            }}
                          >
                            {IsShowmoreCom[index] ? "Show Less" : "Show More"}
                          </span>
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <button>
                            <GoThumbsup
                              size={19}
                              className="hover:text-[#65B8FF]"
                            />
                          </button>
                          <span className="text-[12px] text-gray-400">
                            {comment.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Suggested Videos */}
      <div className="lg:col-span-1 p-2">
        <h3 className="text-lg font-bold mb-4">Suggested Videos</h3>
        <div className="space-y-4">
          {suggestedVideos.map((video, index) => (
            <div
              key={index}
              className="flex border border-white bg-black text-white overflow-hidden"
            >
              <img
                src={img}
                alt="Thumbnail"
                className="w-40 h-24 object-cover"
              />
              <div className="p-2 flex flex-col justify-between">
                <h3 className="text-sm font-semibold leading-tight">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-400">{video.channlename}</p>
                <p className="text-xs text-gray-400">
                  {video.views} • {video.time}
                </p>
              </div>
            </div>
          ))}
        </div>
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
                  <input type="checkbox" className="w-4 h-4 text-purple-500" />
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
  );
};

export default VideoPage;
