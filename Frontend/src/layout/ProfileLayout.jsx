import { useState, useEffect } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import { GoBell, GoBellSlash } from "react-icons/go";
import { FaCircleCheck } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserChannelProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../redux/slices/Authslice";
import ImageCropper from "../utils/ImageCropper";
import { useForm } from "react-hook-form";
import { handleError, handleSuccess } from "../utils/toast";
import { FiEdit } from "react-icons/fi";
import defaultcover from "../assets/images/DefaultCoverimg.jpg"

function ProfileLayout() {
  const { username } = useParams();
  const dispatch = useDispatch();

  const { user, userChannelProfile, isLoading, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  console.log("userChannelProfile", userChannelProfile);
  useEffect(() => {
    dispatch(fetchUserChannelProfile(username));
  }, [username, dispatch]);

  const isProfileOwner =
    user && userChannelProfile && user.username === userChannelProfile.username;

  const [activeFilter, setActiveFilter] = useState("Latest");
  const filters = ["Latest", "Popular", "Oldest"];

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [cropType, setCropType] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

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

    try {
      const result = await dispatch(updateUserAvatar(avatar)).unwrap();
      if (result) {
        handleSuccess("Avatar updated successfully!");
        setAvatar(null); // Reset avatar state
        setAvatarPreview(null); // Reset avatar preview
        // Refresh user data
        dispatch(fetchUserChannelProfile(username));
      }
    } catch (error) {
      handleError(error || "Failed to update avatar.");
    }
  };

  const handleUpdateCoverImage = async () => {
    if (!coverImage) {
      handleError("Cover image is required!");
      return;
    }

    try {
      const result = await dispatch(updateUserCoverImage(coverImage)).unwrap();
      if (result) {
        handleSuccess("Cover image updated successfully!");
        setCoverImage(null); // Reset cover image state
        setCoverImagePreview(null); // Reset cover image preview
        // Refresh user data
        dispatch(fetchUserChannelProfile(username));
      }
    } catch (error) {
      handleError(error || "Failed to update cover image.");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });
  // Open Modal
  const openModal = () => {
    reset({ fullName: user.fullName, email: user.email }); // Pre-fill form with current user data
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle Form Submission
  const onSubmit = async (data) => {
    try {
      const result = await dispatch(updateAccountDetails(data)).unwrap();
      if (result) {
        handleSuccess("Account details updated successfully!");
        closeModal();
        dispatch(fetchUserChannelProfile(username)); // Refresh user data
      }
    } catch (error) {
      handleError(error || "Failed to update account details.");
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!userChannelProfile) {
    return <div className="text-center py-10">User not found</div>;
  }

  return (
    <div className="dark:bg-black bg-white text-black min-h-screen dark:text-white px-2 pt-10 pb-4 overflow-x-hidden md:px-8">
      {/* Cover Image */}
      <div className="relative">
          <img
            src={coverImagePreview || userChannelProfile.coverImage || defaultcover}
            alt="coverimage"
            className="object-cover object-center w-full h-48 rounded-lg"
          />

        {isProfileOwner && (
          <button
            onClick={() => {
              setCropType("cover");
              setShowCropper(true);
            }}
            className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm transition-all"
          >
            <FiEdit className="text-base" />
             Edit cover
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="flex flex-col gap-4 mt-4 sm:flex-row md:mt-8">
        <div className="relative">
          {userChannelProfile.avatar && (
            <img
              src={avatarPreview || userChannelProfile.avatar}
              alt="Profile"
              className="object-cover object-center mx-auto rounded-full size-24 md:size-40 sm:mx-0"
            />
          )}
          {isProfileOwner && (
            <button
              onClick={() => {
                setCropType("avatar");
                setShowCropper(true);
              }}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm transition-all"
            >
              <FiEdit className="text-base" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 text-center md:gap-3 sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl md:text-3xl">
              {userChannelProfile.fullName}
            </h1>
            {/* <FaCircleCheck size={16} /> */}
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
                  onClick={openModal}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl"
                >
                  Update Account Details
                </button>
                {/* Modal for Updating Account Details */}
                {isModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                      <h2 className="text-xl font-bold mb-4 dark:text-white">
                        Update Account Details
                      </h2>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Full Name
                          </label>
                          <input
                            type="text"
                            {...register("fullName", {
                              required: "Full Name is required",
                            })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.fullName.message}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            {...register("email", {
                              required: "Email is required",
                            })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                {/* Show "Save Avatar" button only if avatar is selected */}
                {avatar && (
                  <button
                    onClick={handleUpdateAvatar}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl"
                  >
                    Save Avatar
                  </button>
                )}
                {/* Show "Save Cover Image" button only if coverImage is selected */}
                {coverImage && (
                  <button
                    onClick={handleUpdateCoverImage}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm dark:text-gray-100 dark:bg-gray-700 text-gray-950 bg-gray-600 rounded-3xl"
                  >
                    Save Cover Image
                  </button>
                )}
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

      <div className="flex px-3 md:px-5 mt-7 gap-5 overflow-x-auto">
        {["Videos", "Shorts", "Live", "Playlists", "Posts"].map((tab) => (
          <NavLink
            key={tab}
            to={tab.toLowerCase()}
            className={({ isActive }) =>
              `relative py-2 px-4 transition-all font-semibold
              ${
                isActive
                  ? "text-black dark:text-white font-bold after:absolute hover:after:bg-black dark:hover:after:bg-white after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black dark:after:bg-white"
                  : "text-gray-500"
              }
              hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-gray-400`
            }
          >
            {tab}
          </NavLink>
        ))}
      </div>

      <hr className="mx-3 md:mx-5" />

      <div className="flex my-4 gap-3 px-3 md:px-5 mt-7">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all
            ${
              activeFilter === filter
                ? "bg-black text-white dark:bg-gray-200 dark:text-black"
                : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Page Content */}
      <div className="px-3 md:px-5">
        <Outlet />
      </div>
      {/* Image Cropper Modal */}
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
