import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../redux/slices/Authslice";
import { handleError, handleSuccess } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import ImageCropper from "../../utils/ImageCropper";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

  const onSubmit = async (data) => {
    try {
        if (!avatar) {
          handleError("Avatar is required!");
          return;
        }
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("fullName", data.fullName);
      formData.append("password", data.password);

      // Convert base64 images to blobs before appending

      formData.append("avatar", avatar); // ✅ Real file now!
      if (coverImage) formData.append("coverImage", coverImage); // ✅ Real file now!

      console.log("Form Submitted", formData); // Debugging

      // formData.append("avatar", data.avatar[0]);
      // if (data.coverImage?.length > 0) {
      //   formData.append("coverImage", data.coverImage[0]);
      // }

      const result = await dispatch(registerUser(formData)).unwrap();

      if (result.success) {
        handleSuccess(result.message || "Registered successfully!");

        // Auto login after successful registration
        const loginData = {
          email: data.email,
          password: data.password,
        };

        const loginResult = await dispatch(loginUser(loginData)).unwrap();

        if (loginResult.success) {
          handleSuccess("Logged in successfully!");
          navigate("/"); // Redirect to homepage
        }
      }
    } catch (err) {
      handleError(err || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center p-6 dark:bg-black dark:text-white text-black bg-white rounded-lg">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="dark:bg-gray-800 bg-gray-200 p-6 border border-gray-500 rounded-lg shadow-xl w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

        {/* username */}
        <div>
          <label htmlFor="username" className="block">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register("username", { required: "Username is required" })}
            className="w-full p-1 rounded-lg dark:bg-black bg-white"
          />
          {errors.username && (
            <p className="text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* email */}
        <div>
          <label htmlFor="email" className="block">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            className="w-full p-1 rounded-lg dark:bg-black bg-white"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* fullName  */}
        <div>
          <label htmlFor="fullName" className="block">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            {...register("fullName", { required: "Full Name is required" })}
            className="w-full p-1 rounded-lg dark:bg-black bg-white"
          />
          {errors.fullName && (
            <p className="text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* avatar */}
        {/* <div>
          <label htmlFor="avatar" className="block">
            Avatar{" "}
          </label>
          <label
            htmlFor="avatar"
            className="inline-block bg-gradient-to-r mt-1 from-yellow-500 to-pink-500 text-white px-4 py-1 rounded cursor-pointer hover:opacity-90 transition"
          >
            Upload Avatar
          </label>
          <input
            id="avatar"
            type="file"
            name="avatar"
            accept="image/*"
            {...register("avatar", {
              required: "Avatar is required",
              validate: {
                fileType: (value) => {
                  const file = value?.[0];
                  if (!file) return "Please select file";
                  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                  return (
                    allowedTypes.includes(file?.type) ||
                    "Only jpg, jpeg, and png are allowed"
                  );
                },
              },
            })}
            className="hidden"
          />
          {errors.avatar && (
            <p className="text-red-500">{errors.avatar.message}</p>
          )}
        </div> */}

        {/* cover image  */}
        {/* <div>
          <label htmlFor="coverImage" className="block">
            Cover Image
          </label>
          <label
            htmlFor="coverImage"
            className="inline-block bg-gradient-to-r mt-1 from-yellow-500 to-pink-500 text-white px-4 py-1 rounded cursor-pointer hover:opacity-90 transition"
          >
            Upload Cover Image
          </label>
          <input
            id="coverImage"
            type="file"
            className="hidden"
            name="coverImage"
            accept="image/*"
            {...register("coverImage", {
              validate: {
                fileType: (value) => {
                  const file = value?.[0];
                  if (!file) return "Please select file";
                  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                  return (
                    allowedTypes.includes(file?.type) ||
                    "Only jpg, jpeg, and png are allowed"
                  );
                },
              },
            })}
          />
        </div> */}

        {/* Avatar Upload with Cropping */}
        <div>
          <label className="block">Avatar</label>
          <button
            type="button"
            className="bg-[#7E60BF] hover:bg-[#433878] rounded-2xl text-white px-4 py-1.5 cursor-pointer transition-all duration-300"
            onClick={() => {
              setCropType("avatar");
              setShowCropper(true);
            }}
          >
            Upload Avatar
          </button>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="mt-2 w-16 h-16 rounded-full"
            />
          )}
        </div>

        {/* Cover Image Upload with Cropping */}
        <div>
          <label className="block">Cover Image</label>
          <button
            type="button"
            className="bg-[#7E60BF] hover:bg-[#433878] text-white px-4 py-1.5 rounded-2xl cursor-pointer transition-all duration-300"
            onClick={() => {
              setCropType("cover");
              setShowCropper(true);
            }}
          >
            Upload Cover Image
          </button>
          {coverImagePreview && (
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="mt-2 w-full h-32 rounded"
            />
          )}
        </div>

        {/* password */}
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className="w-full p-1 rounded-lg dark:bg-black bg-white"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg text-lg font-semibold shadow-md hover:opacity-90 transition"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
      {showCropper && (
        <ImageCropper
          cropType={cropType}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropper(false)}
        />
      )}
    </div>
  );
};

export default Signup;
