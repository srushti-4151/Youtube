import { toggleSidebar } from "../redux/slices/Sidebarslice.js";
import {
  AiOutlineMenu,
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineAudio,
} from "react-icons/ai";
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
import { fetchSearchResults, setQuery } from "../redux/slices/searchSlice.js";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileSearchRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  // console.log("User:", user);
  const theme = useSelector((state) => state.theme.theme);
  const recognitionRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState("");
  const [voiceSearchResults, setVoiceSearchResults] = useState([]);

  const [query, setquery] = useState("");
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search/${query}`); // Navigate to search results page
    }
    setquery("")
    // dispatch(fetchSearchResults(query)); // Directly call fetchSearchResults
  };

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

  // Voice Search Functionality
  // const handleVoiceSearch = () => {
  //   if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
  //     alert("Your browser does not support voice search.");
  //     return;
  //   }

  //   const SpeechRecognition =
  //     window.SpeechRecognition || window.webkitSpeechRecognition;
  //   recognitionRef.current = new SpeechRecognition();
  //   recognitionRef.current.lang = "en-US";
  //   recognitionRef.current.start();

  //   recognitionRef.current.onresult = (event) => {
  //     const speechText = event.results[0][0].transcript;
  //     setquery(speechText);
  //     handleSearch(); // Trigger search after voice input
  //   };

  //   recognitionRef.current.onerror = (event) => {
  //     console.error("Speech recognition error:", event.error);
  //   };
  // };

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
  
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Your browser does not support voice search.");
      return;
    }
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";
  
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setVoiceSearchText("Listening...");
      setVoiceSearchResults([]);
    };
  
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
  
      setVoiceSearchText(transcript);
      setquery(transcript); // Update the search query in real-time
  
      if (event.results[0].isFinal) {
        setVoiceSearchResults(prev => [...prev, transcript]);
        recognitionRef.current.stop();
        setIsListening(false);
        
        // Automatically trigger search after short delay
        setTimeout(() => {
          navigate(`/search/${transcript}`);
        }, 500); // Small delay to ensure UI updates
      }
    };
  
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setVoiceSearchText("");
    };
  
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  
    recognitionRef.current.start();
  };

  return (
    <>
      {isListening && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl p-6">
            {/* Microphone animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center voice-pulse">
                  <AiOutlineAudio size={32} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-red-600 animate-ping opacity-75"></div>
              </div>
            </div>

            {/* Listening text */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Listening...
              </h1>
              <p className="text-xl text-gray-300">{voiceSearchText}</p>
            </div>

            {/* Search results preview (optional) */}
            {voiceSearchResults.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Did you mean:
                </h2>
                <ul className="space-y-2">
                  {voiceSearchResults.map((result, index) => (
                    <li
                      key={index}
                      className="text-gray-300 hover:text-white cursor-pointer"
                    >
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleVoiceSearch}
                className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                Stop Listening
              </button>
            </div>
          </div>
        </div>
      )}
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
            onChange={(e) => setquery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Search on Enter
          />
          <button
            onClick={handleSearch}
            className="py-2 px-4 rounded-r-full dark:bg-[#222222] dark:border-gray-600 border border-secondary-marginal-border border-l-0 flex-shrink-0"
          >
            <AiOutlineSearch className="text-xl" />
          </button>
          {/* <button
            onClick={handleVoiceSearch}
            className="px-2 py-2 ml-2 dark:text-white text-black rounded-full dark:bg-gray-800 dark:hover:bg-gray-700 bg-gray-100 hover:bg-gray-300"
          >
            <AiOutlineAudio size={22} />
          </button> */}
          <button
            onClick={handleVoiceSearch}
            className={`px-2 py-2 ml-2 rounded-full transition-all ${
              isListening
                ? "bg-red-600 text-white"
                : "dark:bg-gray-800 dark:hover:bg-gray-700 bg-gray-100 hover:bg-gray-300 dark:text-white text-black"
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice search"}
          >
            <AiOutlineAudio size={22} />
          </button>
        </div>

        {/* Right - Icons */}
        <div className="hidden relative md:flex items-center gap-4  transition-all duration-300">
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
          </button>
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
          {showMobileSearch ? (
            <div
              ref={mobileSearchRef}
              className="absolute left-0 top-14 w-full dark:bg-black bg-white px-4 py-2 flex items-center border-b dark:border-gray-700"
            >
              <button
                onClick={() => setShowMobileSearch(false)}
                className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AiOutlineClose />
              </button>
              <input
                type="text" // Changed from "search" to "text" for better mobile compatibility
                placeholder="Search"
                aria-label="Search"
                className="flex-grow rounded-l-full border dark:bg-[#121212] dark:border-gray-600 border-secondary-marginal-border py-1 px-4 text-sm focus:border-blue-500 outline-none"
                value={query} // Make sure this is properly bound
                onChange={(e) => setquery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="py-1 px-3 rounded-r-full dark:bg-[#222222] dark:border-gray-600 border border-secondary-marginal-border border-l-0"
              >
                <AiOutlineSearch className="text-lg" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {/* Search Icon */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AiOutlineSearch className="text-xl" />
              </button>
            </div>
          )}
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
          <button
            onClick={handleVoiceSearch}
            className={`px-2 py-2 rounded-full transition-all ${
              isListening
                ? "bg-red-600 text-white"
                : "dark:bg-gray-800 dark:hover:bg-gray-700 bg-gray-100 hover:bg-gray-300 dark:text-white text-black"
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice search"}
          >
            <AiOutlineAudio size={22} />
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
