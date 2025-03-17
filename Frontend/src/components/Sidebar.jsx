import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../redux/slices/Sidebarslice.js";
import {
  AiOutlineMenu,
  AiOutlineHome,
  AiOutlineHistory,
  AiOutlineLike,
  AiOutlineVideoCamera,
  AiOutlineSetting,
} from "react-icons/ai";
import { BsCollectionPlay } from "react-icons/bs";
import { FaRegUserCircle, FaRegQuestionCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const isOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const dispatch = useDispatch();

  return (
    // <div className={`h-screen bg-black text-white transition-all duration-300 ${isOpen ? "w-60" : "w-16"}`}>
    <div
      className={`hidden md:block h-screen bg-black text-white p-2 transition-all duration-300 border-r border-white ${
        isOpen ? "w-60" : "md:w-16 w-0 overflow-hidden"
      } fixed top-0 left-0 z-50 flex flex-col`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex items-center">
        <AiOutlineMenu
          className="text-2xl cursor-pointer"
          onClick={() => dispatch(toggleSidebar())}
        />
      </div>

      <div className="flex h-full flex-col flex-1 justify-between">
        {/* Sidebar Items */}
        <ul className="mt-3 space-y-2">
          <SidebarItem
            to="/"
            icon={<AiOutlineHome />}
            text="Home"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/liked-videos"
            icon={<AiOutlineLike />}
            text="LikedVideos"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/history"
            icon={<AiOutlineHistory />}
            text="History"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/my-content"
            icon={<AiOutlineVideoCamera />}
            text="MyContent"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/collection"
            icon={<BsCollectionPlay />}
            text="Collection"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/subscribers"
            icon={<FaRegUserCircle />}
            text="Subscribers"
            isOpen={isOpen}
          />
        </ul>

        {/* Bottom Buttons */}
        <ul className="pb-4 space-y-2">
          <SidebarItem
            to="/support"
            icon={<FaRegQuestionCircle />}
            text="Support"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/settings"
            icon={<AiOutlineSetting />}
            text="Settings"
            isOpen={isOpen}
          />
        </ul>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon, text, isOpen }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center ${
          isOpen ? "justify-start px-4" : "justify-center"
        } py-2 hover:bg-gray-800 cursor-pointer border border-white w-full 
        ${isActive ? "bg-gray-800" : ""}`
      }
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`ml-4 transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100 delay-200"
            : "opacity-0 scale-90 hidden"
        }`}
      >
        {text}
      </span>
    </NavLink>
  </li>
);

export default Sidebar;
