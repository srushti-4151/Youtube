import { toggleSidebar } from "../redux/slices/Sidebarslice.js";
import { AiOutlineMenu, AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { MdOutlineVideoCall } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/images/logo1.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { RiMenu3Line } from "react-icons/ri";
import { fetchCurrentUser, logoutUser } from "../redux/slices/Authslice.js";
import { handleSuccess } from "../utils/toast.js";
import { AiOutlineUser } from "react-icons/ai";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import { toggleTheme } from "../redux/slices/ThemeSlice.js";

const Navbar = () => {
  const navigate = useNavigate();
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
    navigate("/");
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
      <nav className="h-14 hidden dark:bg-black bg-white md:flex fixed top-0 left-0 w-full items-center justify-between py-1 px-7 z-50">
        {/* Left - Logo & Menu */}
        <div className="flex items-center space-x-4">
          <AiOutlineMenu
            className="text-2xl cursor-pointer"
            onClick={() => dispatch(toggleSidebar())}
          />
          <img src={logo} alt="YouTube Logo" className="h-6 cursor-pointer" />
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
          {/* <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            {theme === "light" ? (
              <MdDarkMode size={20} />
            ) : (
              <MdOutlineLightMode size={20} />
            )}
          </button> */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`
                relative p-2 rounded-full 
                bg-gray-100 hover:bg-gray-200 
                dark:bg-gray-700 dark:hover:bg-gray-600
                transition-all duration-300 ease-in-out
                shadow-sm hover:shadow-md
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-[#ae7aff] focus:ring-offset-2
                group
              `}
          >
            {/* Moon/Sun Icons with animation */}
            <div className="relative w-5 h-5 overflow-hidden">
              <MdDarkMode
                size={20}
                className={`
                        absolute transition-all duration-300 ease-in-out
                        ${
                          theme === "light"
                            ? "rotate-0 opacity-100"
                            : "-rotate-90 opacity-0"
                        }
                        text-gray-700 group-hover:text-gray-900
                        dark:text-gray-300 dark:group-hover:text-white
                      `}
              />
              <MdOutlineLightMode
                size={20}
                className={`
                      absolute transition-all duration-300 ease-in-out
                      ${
                        theme === "light"
                          ? "rotate-90 opacity-0"
                          : "rotate-0 opacity-100"
                      }
                      text-gray-700 group-hover:text-gray-900
                      dark:text-gray-300 dark:group-hover:text-white
                    `}
              />
            </div>

            {/* Optional animated background circle (uncomment if needed) */}
            {/* <span className="absolute inset-0 rounded-full bg-[#ae7aff] opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10" /> */}
          </button>
          {/* {user ? (
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
                to="/login"
                className={({ isActive }) => `
                  relative py-1.5 px-6 rounded-full font-medium 
                  dark:text-white text-black bg-transparent hover:text-white
                  border-2 border-[#ae7aff] hover:bg-gradient-to-r hover:from-[#9161df] hover:to-[#6e3dff]
                  transition-all duration-300 ease-out
                  overflow-hidden group
                  shadow-lg hover:shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                  transform hover:-translate-y-0.5
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#ae7aff] to-[#8a4fff] border-transparent shadow-lg hover:shadow-[0_4px_15px_rgba(174,122,255,0.4)]"
                      : "bg-transparent border-[#ae7aff]"
                  }
                `}
              >
                <span className="relative z-10">Login</span>
                <span
                  className="absolute inset-0 bg-[#ae7aff] opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300
                    -z-0 rounded-full scale-0 group-hover:scale-100 
                    origin-center"
                />
              </NavLink>

              <NavLink
                to="/signup"
                className={`
                  relative py-1.5 px-6 rounded-full font-medium
                  text-white bg-gradient-to-r from-[#ae7aff] to-[#8a4fff]
                  hover:from-[#9161df] hover:to-[#6e3dff]
                  shadow-lg hover:shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                  transition-all duration-300 ease-out
                  transform hover:-translate-y-0.5
                  border-2 border-transparent
                `}
              >
                <span className="relative z-10">Signup</span>
                <span
                  className="absolute inset-0 bg-white opacity-0 
                    hover:opacity-10 transition-opacity duration-300
                    rounded-full"
                />
              </NavLink>
            </>
          )} */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
                className="flex items-center gap-2 focus:ring-offset-2 rounded-full transition-all"
              >
                <img
                  src={user.avatar}
                  alt={`${user.username}'s profile`}
                  className="w-10 h-10 rounded-full object-cover transition-all"
                />
                <span className="sr-only">User menu</span>
              </button>

              {/* Animated Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-56 origin-top-right dark:bg-gray-800 bg-white rounded-md shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-gray-700 transition-all duration-200 ease-out ${
                  isDropdownOpen
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
                role="menu"
              >
                {/* User Profile Section */}
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full group-hover:ring-2 group-hover:ring-[#ae7aff] transition-all"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Dropdown Items */}
                <div className="py-1">
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Settings
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Keyboard Shortcuts
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className={({ isActive }) => `
                    relative py-2 px-6 rounded-full font-medium text-sm
                    dark:text-white text-black
                    hover:bg-gradient-to-r hover:from-[#9161df] hover:to-[#6e3dff]
                    hover:shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                    transform hover:-translate-y-0.5
                    border-2 border-[#ae7aff]
                    transition-all duration-300 ease-out
                    overflow-hidden group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#ae7aff] to-[#8a4fff] text-white shadow-lg"
                        : ""
                    }
                  `}
              >
                <span className="relative z-10 flex items-center justify-center gap-1">
                  Login
                </span>
              </NavLink>

              <NavLink
                to="/signup"
                className={({ isActive }) => `
                  relative py-[9px] px-6 rounded-full font-medium text-sm
                  text-white bg-gradient-to-r from-[#ae7aff] to-[#8a4fff]
                  hover:from-[#9161df] hover:to-[#6e3dff]
                  shadow-lg hover:shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                  transition-all duration-300 ease-out
                  transform hover:-translate-y-0.5
                `}
              >
                <span className="relative z-10 flex items-center justify-center gap-1">
                  Sign Up
                </span>
                <span
                  className="absolute inset-0 bg-white opacity-0 
                  hover:opacity-10 transition-opacity duration-300"
                />
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <nav className="h-14 md:hidden dark:bg-black bg-white flex fixed top-0 left-0 w-full items-center justify-between py-1 px-5 shadow-md z-50 border-b border-white">
        {/* Left - Logo */}
        <NavLink to={"/"} className="flex items-center">
          <img src={logo} alt="Logo" className="h-4 cursor-pointer" />
        </NavLink>

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
            className={`
                relative p-2 rounded-full 
                bg-gray-100 hover:bg-gray-200 
                dark:bg-gray-700 dark:hover:bg-gray-600
                transition-all duration-300 ease-in-out
                shadow-sm hover:shadow-md
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-[#ae7aff]
                group
              `}
          >
            {/* Moon/Sun Icons with animation */}
            <div className="relative w-5 h-5 overflow-hidden">
              <MdDarkMode
                size={20}
                className={`
                        absolute transition-all duration-300 ease-in-out
                        ${
                          theme === "light"
                            ? "rotate-0 opacity-100"
                            : "-rotate-90 opacity-0"
                        }
                        text-gray-700 group-hover:text-gray-900
                        dark:text-gray-300 dark:group-hover:text-white
                      `}
              />
              <MdOutlineLightMode
                size={20}
                className={`
                      absolute transition-all duration-300 ease-in-out
                      ${
                        theme === "light"
                          ? "rotate-90 opacity-0"
                          : "rotate-0 opacity-100"
                      }
                      text-gray-700 group-hover:text-gray-900
                      dark:text-gray-300 dark:group-hover:text-white
                    `}
              />
            </div>
          </button>

          {/* Mobile Menu Humburge */}
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
          <div className="mt-2 space-y-4">
            <NavLink
              to="/login"
              className={({ isActive }) => `
                  relative py-[9px] px-6 rounded-full font-medium text-[16px] 
                  text-white bg-gradient-to-r from-[#ae7aff] to-[#8a4fff]
                  shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                  transition-all duration-300 ease-out
                  overflow-hidden group z-10 flex items-center justify-center
                `}
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) => `
                  relative py-[9px] px-6 rounded-full font-medium text-[16px] 
                  text-white bg-gradient-to-r from-[#ae7aff] to-[#8a4fff]
                  shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                  transition-all duration-300 ease-out
                  overflow-hidden group z-10 flex items-center justify-center
                `}
            >
              Signup
            </NavLink>
          </div>

          <hr className="my-4" />

          <div className="space-y-4">
            <NavLink
              to="/liked-videos"
              className={({ isActive }) => `
                    relative py-1.5 px-4 rounded-full font-medium text-[16px]
                    dark:text-white text-black
                    bg-gradient-to-r from-[#9161df]to-[#6e3dff]
                    shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                    border-2 border-[#ae7aff]
                    transition-all duration-300 ease-out
                    overflow-hidden group z-10 flex items-center justify-center
                   
                  `}
            >
              Liked Videos
            </NavLink>
            <NavLink
              to="/my-content"
              className={({ isActive }) => `
                    relative py-1.5 px-4 rounded-full font-medium text-[16px]
                    dark:text-white text-black
                    bg-gradient-to-r from-[#9161df]to-[#6e3dff]
                    shadow-[0_4px_15px_rgba(174,122,255,0.4)]
                    border-2 border-[#ae7aff]
                    transition-all duration-300 ease-out
                    overflow-hidden group z-10 flex items-center justify-center
                   
                  `}
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
