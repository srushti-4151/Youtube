import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LikedVideos from "./pages/LikedVideos/LikedVideos";
import History from "./pages/History/History";
import MyContent from "./pages/MyContent/MyContent";
import Collection from "./pages/Collection/Collection";
import Subscribers from "./pages/Subscribers/Subscribers";
import Home from "./pages/Home/Home";
import { useDispatch, useSelector } from "react-redux";
import VideoPage from "./pages/VideoPage/VideoPage";
import MobileBottomBar from "./components/MobileBottomBar";
import ProfileLayout from "./layout/ProfileLayout";
import VideoSection from "./pages/Profile/VideoSection";
import PlaylistSection from "./pages/Profile/PlaylistSection";
import TweetsSection from "./pages/Profile/TweetsSection";
import FollowingSection from "./pages/Profile/FollowingSection";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
} from "./redux/slices/Authslice";
import Login from "./pages/LoginSignup/Login";
import Signup from "./pages/LoginSignup/Signup";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(fetchCurrentUser()).then((res) => console.log("user fetched : ", res));
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // const user = useSelector((state) => state.auth.user)
  // console.log("userr",user)

  const SidebarisOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            SidebarisOpen ? "lg:ml-60 md:ml-16 ml-0" : "md:ml-16 ml-0"
          }`}
        >
        {/* <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isAuthenticated
              ? SidebarisOpen
                ? "lg:ml-60 md:ml-16 ml-0" // Sidebar Open -> Margin applied
                : "md:ml-16 ml-0" // Sidebar Closed -> Small Margin for MD screens
              : "ml-0" // No Sidebar (Unauthenticated) -> No Margin
          }`}
        > */}
          <Navbar />
          <MobileBottomBar />
          <div className="mt-16 mb-20 md:mb-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/video-page/:id" element={<VideoPage />} />
              <Route path="/liked-videos" element={<LikedVideos />} />
              <Route path="/history" element={<History />} />
              <Route path="/my-content" element={<MyContent />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/subscribers" element={<Subscribers />} />
              <Route path="/profile/:username" element={<ProfileLayout />}>
                <Route path="videos" element={<VideoSection />} />
                <Route path="playlists" element={<PlaylistSection />} />
                <Route path="tweets" element={<TweetsSection />} />
                <Route path="following" element={<FollowingSection />} />
              </Route>
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
