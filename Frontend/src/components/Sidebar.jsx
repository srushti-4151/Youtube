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
import { MdOutlineWatchLater } from "react-icons/md";


const Sidebar = () => {
  const isOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const dispatch = useDispatch();

  return (
    <div
      className={`hidden dark:bg-black bg-white md:block h-screen py-2 transition-all duration-300 ease-in-out ${
        isOpen ? "w-60 px-2" : "w-16 px-0"
      } fixed top-0 left-0 z-50 flex flex-col shadow-xl`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex items-center justify-center">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <AiOutlineMenu className="text-xl" />
        </button>
      </div>

      <div className="pt-2 flex h-full flex-col flex-1 justify-between overflow-y-auto">
        {/* Sidebar Items */}
        <ul className="space-y-1">
          <SidebarItem
            to="/"
            icon={<AiOutlineHome />}
            text="Home"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/liked-videos"
            icon={<AiOutlineLike />}
            text="Liked Videos"
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
            text="My Content"
            isOpen={isOpen}
          />
          <SidebarItem
            // to={`/profile/${username}/playlists`}
            to={"/playlists"}
            icon={<BsCollectionPlay />}
            text="Playlists"
            isOpen={isOpen}
          />
          <SidebarItem
            to="/watchlater"
            icon={<MdOutlineWatchLater />}
            text="WatchLater"
            isOpen={isOpen}
          />
        </ul>

        {/* Bottom Buttons */}
        <ul className="pb-14 space-y-1">
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
        `flex items-center rounded-lg transition-all duration-200 ease-out mx-2 ${
          isOpen ? "justify-start px-4" : "justify-center"
        } py-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer w-full group ${
          isActive
            ? "bg-[#ae7aff]/10 text-[#ae7aff] dark:text-[#ae7aff] font-medium"
            : "text-gray-700 dark:text-gray-300"
        }`
      }
    >
      <span className={`text-2xl ${isOpen ? "mr-4" : ""}`}>{icon}</span>
      <span
        className={`whitespace-nowrap transition-all duration-200 ${
          isOpen
            ? "opacity-100 translate-x-0 w-auto"
            : "opacity-0 translate-x-4 w-0 absolute"
        }`}
      >
        {text}
      </span>
      {!isOpen && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {text}
        </div>
      )}
    </NavLink>
  </li>
);

export default Sidebar;





// import { useSelector, useDispatch } from "react-redux";
// import { toggleSidebar } from "../redux/slices/Sidebarslice.js";
// import {
//   AiOutlineMenu,
//   AiOutlineHome,
//   AiOutlineHistory,
//   AiOutlineLike,
//   AiOutlineVideoCamera,
//   AiOutlineSetting,
// } from "react-icons/ai";
// import { BsCollectionPlay } from "react-icons/bs";
// import { FaRegUserCircle, FaRegQuestionCircle } from "react-icons/fa";
// import { NavLink } from "react-router-dom";

// const Sidebar = () => {
//   const isOpen = useSelector((state) => state.sidebar.isSidebarOpen);
//   const dispatch = useDispatch();

//   return (
//     // <div className={`h-screen bg-black text-white transition-all duration-300 ${isOpen ? "w-60" : "w-16"}`}>
//     <div
//       className={`hidden dark:bg-black bg-white md:block h-screen py-2 pl-2 transition-all duration-300 ${
//         isOpen ? "w-60 pr-7" : "md:w-16 w-0 pr-0 overflow-hidden"
//       } fixed top-0 left-0 z-50 flex flex-col`}
//     >
//       {/* Toggle Button */}
//       {/* <div className="p-4 flex items-center">
//         <AiOutlineMenu
//           className="text-2xl cursor-pointer"
//           onClick={() => dispatch(toggleSidebar())}
//         />
//       </div> */}

//       <div className="my-16 flex h-full flex-col flex-1 justify-between">
//         {/* Sidebar Items */}
//         <ul className="mt-3 space-y-2">
//           <SidebarItem
//             to="/"
//             icon={<AiOutlineHome />}
//             text="Home"
//             isOpen={isOpen}
//           />
//           <SidebarItem
//             to="/liked-videos"
//             icon={<AiOutlineLike />}
//             text="LikedVideos"
//             isOpen={isOpen}
//           />
//           <SidebarItem
//             to="/history"
//             icon={<AiOutlineHistory />}
//             text="History"
//             isOpen={isOpen}
//           />
//           <SidebarItem
//             to="/my-content"
//             icon={<AiOutlineVideoCamera />}
//             text="MyContent"
//             isOpen={isOpen}
//           />
//           <SidebarItem
//             to="/collection"
//             icon={<BsCollectionPlay />}
//             text="Collection"
//             isOpen={isOpen}
//           />
//           <SidebarItem
//             to="/subscribers"
//             icon={<FaRegUserCircle />}
//             text="Subscribers"
//             isOpen={isOpen}
//           />
//         </ul>

//         {/* Bottom Buttons */}
//         <ul className="pb-16 space-y-2">
//           <SidebarItem
//             to="/support"
//             icon={<FaRegQuestionCircle />}
//             text="Support"
//             isOpen={isOpen}
//           />
//           <SidebarItem
//             to="/settings"
//             icon={<AiOutlineSetting />}
//             text="Settings"
//             isOpen={isOpen}
//           />
//         </ul>
//       </div>
//     </div>
//   );
// };

// const SidebarItem = ({ to, icon, text, isOpen }) => (
//   <li>
//     <NavLink
//       to={to}
//       className={({ isActive }) =>
//         `flex items-center rounded-md transition-all duration-300 ${
//           isOpen ? "justify-start px-4" : "justify-center"
//         } py-3 hover:bg-[#989ba0] hover:text-black cursor-pointer w-full
//         ${isActive ? "bg-[#D1D5DB] text-black" : ""}`
//       }
//     >
//       <span className="text-2xl">{icon}</span>
//       <span
//         className={`ml-4 ${
//           isOpen
//             ? "opacity-100 scale-100"
//             : "opacity-0 scale-90 hidden"
//         }`}
//       >
//         {text}
//       </span>
//     </NavLink>
//   </li>
// );

// export default Sidebar;
