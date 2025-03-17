import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import img1 from "../assets/images/img1.jpg";
import cover from "../assets/images/Designer.png";
import { GoPersonAdd } from "react-icons/go";

function ProfileLayout() {
  // Static data (replace with API call later)
  const [profileData, setProfileData] = useState({
    username: "Yash Mittal",
    handle: "@YashMittal",
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
    <div className="bg-black min-h-screen text-white">
      {/* Cover Image */}
      <div
        className="h-60 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileData.coverImage})` }}
      ></div>

      {/* Profile Header */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center px-3 md:px-5">
        <div className="mt-[-20px]">
          <img
            src={profileData.profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-black"
          />
        </div>

        <div className="md:ml-4 mt-4">
          <h1 className="text-2xl font-bold">{profileData.username}</h1>
          <p className="text-gray-400 text-sm mt-1">{profileData.handle}</p>
          <p className="text-gray-400 text-sm mt-1">
            {profileData.subscribers} Subscribers • {profileData.subscribed}{" "}
            Subscribed
          </p>
        </div>
        <button className="ml-0 md:ml-auto mt-2 px-4 py-2 bg-purple-500 text-black flex items-center gap-2">
          <GoPersonAdd size={20}/> <span> Subscribe </span> 
        </button>
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

      <hr className="my-4 mx-3 md:mx-5"/>

      {/* Page Content */}
      <div className="px-3 md:px-5">
        <Outlet />
      </div>
    </div>
  );
}

export default ProfileLayout;
