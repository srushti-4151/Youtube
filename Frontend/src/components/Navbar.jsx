import { toggleSidebar } from "../redux/slices/Sidebarslice.js";
import { AiOutlineMenu, AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { MdOutlineVideoCall } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/images/logo.png";
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { RiMenu3Line } from "react-icons/ri";
import { fetchCurrentUser, logoutUser } from "../redux/slices/Authslice.js";
import { handleSuccess } from "../utils/toast.js";
import { AiOutlineUser } from "react-icons/ai";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import { toggleTheme } from "../redux/slices/ThemeSlice.js";

const Navbar = () => {
  const dispatch = useDispatch();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  // console.log("User:", user);
  const theme = useSelector((state) => state.theme.theme);

  const handleLogout = () => {
    console.log("Before dispatching logout");
    dispatch(logoutUser());
    console.log("After dispatching logout");
    handleSuccess("logged out");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTimeout(() => setIsDropdownOpen(false), 300);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="hidden dark:bg-black bg-white md:flex fixed top-0 left-0 w-full items-center justify-between py-1 px-7 z-50">
        {/* Left - Logo & Menu */}
        <div className="flex items-center space-x-4">
          <AiOutlineMenu
            className="text-2xl cursor-pointer"
            onClick={() => dispatch(toggleSidebar())}
          />
          <img
            src={logo}
            alt="YouTube Logo"
            className="h-14 w-14 cursor-pointer"
          />
        </div>

        {/* Middle - Search Bar */}
        <div className="flex flex-grow md:max-w-[400px] lg:max-w-[600px]">
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="rounded-l-full border dark:bg-[#121212] dark:shadow-none dark:border-gray-600 dark:focus:border-blue-500 border-secondary-marginal-border shadow-inner shadow-secondary-marginal
             py-1 px-4 text-lg w-full focus:border-blue-500 outline-none"
          />
          <button className="py-2 px-4 rounded-r-full dark:bg-[#222222] dark:border-gray-600 border border-secondary-marginal-border border-l-0 flex-shrink-0">
            <AiOutlineSearch className="text-xl" />
          </button>
        </div>

        {/* Right - Icons */}
        <div className="hidden relative md:flex items-center gap-4  transition-all duration-300">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            {theme === "light" ? (
              <MdDarkMode size={20} />
            ) : (
              <MdOutlineLightMode size={20} />
            )}
          </button>
          {user ? (
            // Show Avatar if Logged In
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              ref={dropdownRef}
              className="cursor-pointer"
            >
              {user ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <FaUserCircle className="text-3xl" />
              )}
              {/* Profile Dropdown */}
              {isDropdownOpen && (
                <div
                  className={`absolute top-10 z-50 right-0 mt-2 w-56 dark:bg-gray-800 bg-white shadow-lg rounded-md py-2 border border-gray-900 transition-all duration-300 ease-out transform ${
                    isDropdownOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-[-10px] pointer-events-none"
                  }`}
                >
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <Link to={`/profile/${user.username}`}>
                    <img
                      src={user.avatar || "https://via.placeholder.com/40"}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    </Link>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <hr className="border-gray-600" />
                  <button className="block w-full text-left px-4 py-2 dark:hover:bg-gray-700 hover:bg-gray-200">
                    Settings
                  </button>
                  <button className="block w-full text-left px-4 py-2 dark:hover:bg-gray-700 hover:bg-gray-200">
                    Keyboard Shortcuts
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-500 dark:hover:bg-gray-700 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink
                to={"/login"}
                className={`py-[6px] px-3 cursor-pointer rounded-sm transition-all duration-300 border border-black hover:border-white`}
              >
                Login
              </NavLink>
              <NavLink
                to={"/signup"}
                className={`py-[6px] px-3 cursor-pointer text-black rounded-sm transition-all duration-300 bg-[#ae7aff] hover:bg-[#9161df]`}
              >
                Signup
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <nav className="h-14 md:hidden dark:bg-black bg-white flex fixed top-0 left-0 w-full items-center justify-between py-1 px-5 shadow-md z-50 border-b border-white">
        {/* Left - Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-12 w-12 cursor-pointer" />
        </div>

        {/* Right - */}
        <div className="flex gap-3">
          {/* Search Bar */}
          <div className="flex items-center justify-end">
            <button className="dark:bg-black bg-white px-2 py-1 rounded-r-full">
              <AiOutlineSearch className="text-xl" />
            </button>
          </div>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            {theme === "light" ? (
              <MdDarkMode size={20} />
            ) : (
              <MdOutlineLightMode size={20} />
            )}
          </button>
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="text-2xl md:hidden"
          >
            {mobileMenu ? <AiOutlineClose /> : <RiMenu3Line />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-14 right-0 w-[70%] h-full dark:text-white text-black dark:bg-black bg-white p-5 flex flex-col transform ${
            mobileMenu ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden`}
        >
          {/* <button
            onClick={() => setMobileMenu(false)}
            className="text-2xl self-end"
          >
            <AiOutlineClose />
          </button> */}
          <div className="mt-2 space-y-4">
            <NavLink
              to={"/"}
              className="block py-2 px-4 border border-white text-center"
            >
              Login
            </NavLink>
            <NavLink
              to={"/"}
              className="block py-2 px-4 bg-[#ae7aff] text-black text-center"
            >
              Signup
            </NavLink>
          </div>
          <hr className="my-4" />
          <div className="space-y-3">
            <NavLink
              to="/liked-videos"
              className="block py-2 px-4 border border-white text-center"
            >
              Liked Videos
            </NavLink>
            <NavLink
              to="/my-content"
              className="block py-2 px-4 border border-white text-center"
            >
              My Content
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
