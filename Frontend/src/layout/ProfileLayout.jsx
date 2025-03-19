import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import img1 from "../assets/images/img1.jpg";
import cover from "../assets/images/Designer.png";
import { GoPersonAdd } from "react-icons/go";
import { GoBell, GoThumbsup } from "react-icons/go";
import { FaCircleCheck } from "react-icons/fa6";

function ProfileLayout() {
  // Static data (replace with API call later)
  const [profileData, setProfileData] = useState({
    username: "Yash Mittal",
    handle: "YashMittal",
    subscribers: "600k",
    subscribed: "220",
    profileImage: img1, // Replace with real image
    coverImage: cover, // Replace with real cover image
  });

  // Simulating API fetch (replace this with actual API call)
  useEffect(() => {
    // fetch("/api/profile")
    //   .then((res) => res.json())
    //   .then((data) => setProfileData(data));
  }, []);

  return (
    <div className="dark:bg-black bg-white text-black min-h-screen dark:text-white px-2 pt-10 pb-4 overflow-x-hidden md:px-8">
      {/* Cover Image */}
      <img
        src={profileData.coverImage}
        alt="coverimage"
        className="object-cover object-center w-full h-40 rounded-lg"
      />

      {/* Profile Header */}
      <div className="flex flex-col gap-4 mt-4 sm:flex-row md:mt-8">
        <img
          src={profileData.profileImage}
          alt="Profile"
          className="object-cover object-center mx-auto rounded-full size-24 md:size-40 sm:mx-0"
        />
        <div className="flex flex-col gap-2 text-center md:gap-3 sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl md:text-3xl">{profileData.username}</h1>
            <FaCircleCheck size={16} />
          </div>
          <div className="flex flex-wrap justify-center gap-1 text-sm sm:justify-start md:text-base">
            <h2>@{profileData.handle}</h2>
            <span className="hidden sm:inline">•</span>

            <p>{profileData.subscribers} Subscribers</p>
            <span className="hidden sm:inline">•</span>

            <p>{10 || 0} Videos</p>
          </div>
          {/* {loggedInUser?.data?._id === channel?.data?._id && (
            <p>email : {channel.data.email}</p>
          )} */}
          {/* {loggedInUser?.data?._id !== channel?.data?._id && ( */}
            <button
              // onClick={() => handleToggleSubscription(channel.data._id)}
              className="flex items-center justify-center w-full gap-2 px-3 py-2 mt-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl sm:w-max sm:mt-0"
              // disabled={isTogglingSubscription}
            >
              {/* {isSubscribed ? <BellRing size={20} /> : <Bell size={20} />}
              <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span> */}
               <GoBell size={20} />
              <span>Subscribe</span>
            </button>
          {/* )} */}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex px-3 md:px-5 mt-7">
        {["video", "playlist", "tweets", "following"].map((tab) => (
          <NavLink
            key={tab}
            to={tab}
            className={({ isActive }) =>
              `py-2 w-[25%] text-white text-center transition-all ${
                isActive
                  ? "bg-white text-purple-600 font-bold "
                  : "hover:text-purple-400"
              }`
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </NavLink>
        ))}
      </div>

      <hr className="my-4 mx-3 md:mx-5" />

      {/* Page Content */}
      <div className="px-3 md:px-5">
        <Outlet />
      </div>
    </div>
  );
}

export default ProfileLayout;
