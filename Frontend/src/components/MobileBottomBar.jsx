import { NavLink } from "react-router-dom";
import { FaHome, FaHistory, FaFolder, FaUsers } from "react-icons/fa";

const MobileBottomBar = () => {
  return (
    <div className="flex md:hidden fixed bottom-0 left-0 w-full bg-black text-white p-3 border-t border-gray-700 justify-around">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center ${
            isActive ? "text-white" : "text-gray-400"
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
            isActive ? "text-white" : "text-gray-400"
          }`
        }
      >
        <FaHistory size={20} />
        <span className="text-xs">History</span>
      </NavLink>

      <NavLink
        to="/collection"
        className={({ isActive }) =>
          `flex flex-col items-center ${
            isActive ? "text-white" : "text-gray-400"
          }`
        }
      >
        <FaFolder size={20} />
        <span className="text-xs">Collection</span>
      </NavLink>

      <NavLink
        to="/subscribers"
        className={({ isActive }) =>
          `flex flex-col items-center ${
            isActive ? "text-white" : "text-gray-400"
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
