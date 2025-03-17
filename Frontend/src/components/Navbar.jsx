import { toggleSidebar } from "../redux/slices/Sidebarslice.js";
import { AiOutlineMenu, AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { MdOutlineVideoCall } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/images/logo.png";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { RiMenu3Line } from "react-icons/ri";
import { fetchCurrentUser, logoutUser } from "../redux/slices/Authslice.js";
import { handleSuccess } from "../utils/toast.js";

const Navbar = () => {
  const dispatch = useDispatch();
  const [mobileMenu, setMobileMenu] = useState(false);

  const { user } = useSelector((state) => state.auth);
  // console.log("User:", user);

  const handleout = () => {
    dispatch(logoutUser());
    handleSuccess("logged out");
  }

  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 w-full bg-black text-white items-center justify-between py-1 px-7 shadow-md z-50">
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
        <div className="flex items-center w-1/2">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-1 bg-gray-900 border border-gray-700 text-white rounded-l-full focus:outline-none"
          />
          <button className="bg-gray-700 px-4 py-2 rounded-r-full">
            <AiOutlineSearch className="text-xl" />
          </button>
        </div>

        {/* Right - Icons */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {user ? (
            // Show Avatar if Logged In
            <div className="flex items-center space-x-2">
              {user.avatar ? (
                <>
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full cursor-pointer"
                />
                <button onClick={handleout}>
                  Logout
                </button>
                </>
              ) : (
                <FaUserCircle className="text-3xl cursor-pointer" />
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

      <nav className="h-14 md:hidden flex fixed top-0 left-0 w-full bg-black text-white items-center justify-between py-1 px-5 shadow-md z-50 border-b border-white">
        {/* Left - Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-12 w-12 cursor-pointer" />
        </div>

        {/* Right - */}
        <div className="flex gap-3">
          {/* Search Bar */}
          <div className="flex items-center justify-end">
            <button className="bg-black px-2 py-1 rounded-r-full">
              <AiOutlineSearch className="text-xl" />
            </button>
          </div>
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
          className={`fixed top-14 right-0 w-[70%] h-full bg-black text-white p-5 flex flex-col transform ${
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
