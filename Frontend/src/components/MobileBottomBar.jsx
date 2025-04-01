import React from 'react'
import { NavLink } from "react-router-dom";
import { FaHome, FaHistory, FaFolder, FaUsers } from "react-icons/fa";

const MobileBottomBar = () => {
  return (
    <div className="z-50 flex md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-black p-3 border-t border-gray-700 justify-around">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center ${
            isActive ? "dark:text-white text-black" : "text-gray-dark:text-gray-400 text-gray-600"
          }`
        }
      >
        <FaHome size={20} />
        <span className="text-xs">Home</span>
      </NavLink>

      <NavLink
        to="/history"
        className={({ isActive }) =>
          `flex flex-col items-center ${
            isActive ? "dark:text-white text-black" : "text-gray-dark:text-gray-400 text-gray-600"
          }`
        }
      >
        <FaHistory size={20} />
        <span className="text-xs">History</span>
      </NavLink>

      <NavLink
        to="/playlists"
        className={({ isActive }) =>
          `flex flex-col items-center ${
            isActive ? "dark:text-white text-black" : "text-gray-dark:text-gray-400 text-gray-600"
          }`
        }
      >
        <FaFolder size={20} />
        <span className="text-xs">playlists</span>
      </NavLink>

      <NavLink
        to="/subscribers"
        className={({ isActive }) =>
          `flex flex-col items-center ${
            isActive ? "dark:text-white text-black" : "text-gray-dark:text-gray-400 text-gray-600"
          }`
        }
      >
        <FaUsers size={20} />
        <span className="text-xs">Subscribers</span>
      </NavLink>
    </div>
  );
};

export default MobileBottomBar;
