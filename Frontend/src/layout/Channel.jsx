import ImageCropper from "../utils/ImageCropper"; // Adjust the import path as needed
import { useState, useEffect } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import { GoBell, GoThumbsup, GoBellSlash } from "react-icons/go";
import { FaCircleCheck } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentUser,
  fetchUserChannelProfile,
} from "../redux/slices/Authslice";
import { fetchUserSubscribers } from "../redux/slices/Subscriptionslice";
function ProfileLayout() {
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [cropType, setCropType] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

    const { username } = useParams();
  const dispatch = useDispatch();
  const { user, userChannelProfile, isLoading, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  console.log("hhh", userChannelProfile);

  useEffect(() => {
    dispatch(fetchUserChannelProfile(username));
  }, [username, dispatch]);

  const isProfileOwner =
    user && userChannelProfile && user.username === userChannelProfile.username;

  // Check if logged-in user has subscribed to the profile being viewed
  const isSubscribed = user?.subscriptions?.includes(userChannelProfile._id);

  const [activeFilter, setActiveFilter] = useState("Latest");

  const filters = ["Latest", "Popular", "Oldest"];

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!userChannelProfile) {
    return <div className="text-center py-10">User not found</div>;
  }

  // Convert Base64 to File
  const base64ToFile = (base64String, filename) => {
    let arr = base64String.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Handle Cropping
  const handleCropComplete = (croppedBase64, type) => {
    const file = base64ToFile(croppedBase64, `${type}.jpg`);
    if (type === "avatar") {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
    setShowCropper(false);
  };

  const handleUpdateAvatar = async () => {
    if (!avatar) {
      handleError("Avatar is required!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", avatar);

    try {
      const response = await fetch("/api/avatar", {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        handleSuccess("Avatar updated successfully!");
        // Refresh user data or update state as needed
      } else {
        handleError("Failed to update avatar.");
      }
    } catch (error) {
      handleError(error.message || "Failed to update avatar.");
    }
  };

  const handleUpdateCoverImage = async () => {
    if (!coverImage) {
      handleError("Cover image is required!");
      return;
    }

    const formData = new FormData();
    formData.append("coverImage", coverImage);

    try {
      const response = await fetch("/api/cover-image", {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        handleSuccess("Cover image updated successfully!");
        // Refresh user data or update state as needed
      } else {
        handleError("Failed to update cover image.");
      }
    } catch (error) {
      handleError(error.message || "Failed to update cover image.");
    }
  };

  return (
    <div className="dark:bg-black bg-white text-black min-h-screen dark:text-white px-2 pt-10 pb-4 overflow-x-hidden md:px-8">
      {/* Cover Image */}
      <div className="relative">
        <img
          src={coverImagePreview || userChannelProfile.coverImage}
          alt="coverimage"
          className="object-cover object-center w-full h-40 rounded-lg"
        />
        {isProfileOwner && (
          <button
            onClick={() => {
              setCropType("cover");
              setShowCropper(true);
            }}
            className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded"
          >
            Update Cover Image
          </button>
        )}
      </div>
      <div></div>

      {/* Profile Header */}
      <div className="flex flex-col gap-4 mt-4 sm:flex-row md:mt-8">
        <div className="relative">
          <img
            src={avatarPreview || userChannelProfile.avatar}
            alt="Profile"
            className="object-cover object-center mx-auto rounded-full size-24 md:size-40 sm:mx-0"
          />
          {isProfileOwner && (
            <button
              onClick={() => {
                setCropType("avatar");
                setShowCropper(true);
              }}
              className="absolute bottom-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-full"
            >
              Update Avatar
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 text-center md:gap-3 sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl md:text-3xl">
              {userChannelProfile.fullName}
            </h1>
            <FaCircleCheck size={16} />
          </div>
          <div className="flex flex-wrap justify-center gap-1 text-sm sm:justify-start md:text-base">
            <h2>@{userChannelProfile.username}</h2>
            <span className="hidden sm:inline">•</span>
            <p>{userChannelProfile.subscribersCount} Subscribers</p>
            <span className="hidden sm:inline">•</span>
            <p>{10 || 0} Videos</p>
          </div>

          {isAuthenticated ? (
            isProfileOwner ? (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateAvatar}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl"
                >
                  Save Avatar
                </button>
                <button
                  onClick={handleUpdateCoverImage}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl"
                >
                  Save Cover Image
                </button>
              </div>
            ) : (
              <button className="flex items-center justify-center w-full gap-2 px-3 py-2 mt-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl sm:w-max sm:mt-0">
                {userChannelProfile.isSubscribed ? (
                  <span>
                    <GoBellSlash size={20} className="inline-block" />{" "}
                    {"Subscribed"}
                  </span>
                ) : (
                  <span>
                    <GoBell size={20} className="inline-block" /> {"Subscribe"}
                  </span>
                )}
              </button>
            )
          ) : (
            <button className="flex items-center justify-center w-full gap-2 px-3 py-2 mt-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl sm:w-max sm:mt-0">
              <GoBell size={20} /> Subscribe
            </button>
          )}
        </div>
      </div>

      {/* Rest of your component */}

      {showCropper && (
        <ImageCropper
          cropType={cropType}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}

export default ProfileLayout;