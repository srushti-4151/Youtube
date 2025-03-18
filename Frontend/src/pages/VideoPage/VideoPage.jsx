import React, { useEffect, useState } from "react";
import { RiShareForwardLine } from "react-icons/ri";
import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";
import { HiDownload } from "react-icons/hi";
import { FaCircleCheck } from "react-icons/fa6";

// import { AiOutlineFolderAdd } from "react-icons/ai";
// import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { GoBell, GoThumbsup } from "react-icons/go";
import img from "../../assets/images/img1.jpg";
import vid1 from "../../assets/images/video1.mp4";
import { LiaThumbsUpSolid  ,LiaThumbsDownSolid  } from "react-icons/lia";
import { Link } from "react-router-dom";


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
        <div className="w-full h-64 lg:h-auto rounded-lg overflow-hidden">
          {videoData ? (
            <div className="relative">
              <video
                src={videoData[0].videoUrl}
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
          title
        </p>

        <div className="flex flex-col items-start justify-between gap-4 mt-4 lg:flex-row">
          <div className="flex items-start gap-3 lg:w-1/2 xl:w-2/3 sm:w-auto">
            <Link
              // href={`/user/${video?.data?.owner.userName}`}
              className="flex-shrink-0"
            >
              <img
                src={img}
                alt="imgg here"
                className="object-cover object-center rounded-full size-10 sm:size-12"
                loading="lazy"
              />
            </Link>
            <div className="flex items-center justify-between w-full xl:flex-col xl:items-start">
              <div className="flex-grow min-w-0 max-w-[70%] md:max-w-full">
                <span className="flex items-center gap-2">
                  <a
                    // href={`/user/${video?.data?.owner.userName}`}
                    className="truncate"
                  >
                    <h1 className="text-sm truncate sm:text-base">
                      {/* {video?.data?.owner.fullName} */} fyull name
                    </h1>
                  </a>
                  <FaCircleCheck size={16} />
                </span>
                <p className="text-sm text-gray-500 sm:text-base">
                  {/* {subscribersCount}{" "} */}1111
                  <span className="text-sm">subscribers</span>
                </p>
              </div>

              <button
                // onClick={() =>
                //   handleToggleSubscription(video?.data.owner._id)
                // }
                // className={`flex items-center gap-2 px-3 text-sm rounded-3xl w-max self-start flex-shrink-0 ml-2 xl:ml-0 ${
                //   isSubscribed
                //     ? "text-gray-100 dark:bg-gray-700"
                //     : "text-gray-900 dark:bg-gray-200"
                // }`}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-3xl w-max self-start flex-shrink-0 ml-2 xl:ml-0 mt-2 text-black bg-gray-200 dark:bg-gray-200`}
                // disabled={isTogglingSubscription}
              >
                {/* {isSubscribed ? <BellRing size={20} /> : <Bell size={20} />}
                  <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span> */}
                <GoBell size={20} />
                <span>Subscribe</span>
              </button>
            </div>
            {/* <button variant="dark" className="px-3 rounded-full">
                Join
              </button> */}
          </div>
          {/*like dislike share download*/}
          <div className="flex flex-wrap items-center justify-start gap-2 full sm:gap-3 lg:flex-nowrap lg:w-1/2 xl:w-1/3 lg:justify-end">
            <div className="flex items-center bg-[#31302f] rounded-full">
              <button
                className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-r-none px-2 sm:px-3 text-xs sm:text-sm"
                // onClick={handleToggleLike}
                // disabled={isTogglingLike}
              >
                {/* {isLiked ? <BiSolidLike size={20} /> : <BiLike size={20} />}
                <p>{video?.data?.likes}</p> */}
                <BiLike size={20} /> <p>10</p>
              </button>

              <div className="border-l border-gray-300 h-5 bg-[#31302f]" />

              <button className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-l-none px-2 py-3 sm:px-3">
                <BiDislike size={20} />
              </button>
            </div>

            <button
              className="bg-[#31302f] flex gap-1 items-center justify-center rounded-full px-2 py-3 sm:px-3 text-xs sm:text-sm"
            >
              <RiShareForwardLine size={24} className="text-gray-400" />
              <p className="hidden sm:inline">Share</p>
            </button>
            <button
              className="bg-[#31302f] flex gap-1 items-center rounded-full justify-center px-2 py-3 sm:px-3 text-xs sm:text-sm"
            >
              <HiDownload size={24} className="text-gray-400" />
              <p className="hidden sm:inline">Download</p>
            </button>

            {/* <button variant="dark" size="icon" className="rounded-full">
                <FaEllipsisH />
              </button> */}
          </div>
        </div>

        {/* Details */}
        <div>
          {/* Video - Title, views, duration  */}
          {/* <h2 className="mt-1 text-xl font-bold">
              Lex Fridman plays Red Dead Redemption 2
            </h2>
            <div className="text-sm mt-1">
              <span className="text-gray-400">109,067 Views • </span>
              <span className="text-gray-400">18 hours ago</span>
            </div> */}
          {/* user , buttons */}
          {/* <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 gap-2">
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
            </div> */}

          {/* description */}
          <div className="shadow-custom bg-[#202021] p-4 my-4 rounded-md text-md dark:bg-[#202021]">
            <p>
              {/* {VIEW_FORMATTER.format(video?.data?.views)} views &nbsp;
                {formatTimeAgo(new Date(video?.data?.createdAt))} */}
              123 views &nbsp; 3 months ago
            </p>
            <p className="mt-3 text-gray-300 leading-relaxed">
              {IsShowmoreDes ? description : shortDescription}
              <span
                className="text-gray-400 font-semibold cursor-pointer ml-1 hover:underline"
                onClick={() => setIsShowmoreDes(!IsShowmoreDes)}
              >
                {IsShowmoreDes ? " Show less" : " more"}
              </span>
            </p>
          </div>

          {/* Comment section */}
          <div className="mt-7 p-4 rounded-2xl">
            <h2 className="text-lg font-semibold mb-2">53 Comments</h2>

            {/* my comment part */}
            <div className="my-3">
              <div className="flex items-center space-x-3 p-2">
                {/* User Avatar */}
                <img
                  src={img}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full"
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
                    className="w-full bg-transparent text-white text-sm border-b-2 focus:border-b-2 focus:border-gray-100 focus:outline-none pb-1 pr-12"
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
                  <div key={index} className="px-2 py-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.avatar}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p>
                          <span className="text-[16px]">
                            {comment.fullname}
                          </span>
                          <span className="ml-2 text-[16px] text-gray-400">
                            {comment.time}
                          </span>
                        </p>
                        <p className="text-[15px]">@{comment.username}</p>

                        <p className="text-[16px] mt-2">
                          {IsShowmoreCom[index] ? comment.text : shortComment}
                          <span
                            className="text-gray-400 text-[14px] font-semibold cursor-pointer ml-1 hover:underline"
                            onClick={() => {
                              setIsShowmoreCom((prev) =>
                                prev.map((val, i) => (i === index ? !val : val))
                              );
                            }}
                          >
                            {IsShowmoreCom[index] ? "Show Less" : "Show More"}
                          </span>
                        </p>

                        <div className="flex mt-2">
                          <button className="">
                            <LiaThumbsUpSolid  size={20} />
                          </button>
                          <span className="text-[14px] text-gray-400">
                            {comment.likes}
                          </span>
                          
                          <button className="ml-5">
                            <LiaThumbsDownSolid  size={20} />
                          </button>
                          <span className="text-[14px] text-gray-400">
                            {comment.likes}
                          </span>

                          <button className="pl-4 text-sm">Reply</button>
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
              className="flex bg-black text-white overflow-hidden"
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
