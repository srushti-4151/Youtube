import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/slices/Authslice";
import { handleError, handleSuccess } from "../../utils/toast";

const Signup = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    // console.log(data);
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("fullName", data.fullName);
      formData.append("password", data.password);
      formData.append("avatar", data.avatar[0]);
      if (data.coverImage?.length > 0) {
        formData.append("coverImage", data.coverImage[0]);
      }

      const result = await dispatch(registerUser(formData)).unwrap();;

      if (result.success) {
        handleSuccess(result.message || "Registered successfully!"); // Show backend message
      }
    } catch (err) {
      handleError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center p-6 bg-gray-900 text-black shadow-lg rounded-lg">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-black p-6 rounded-lg shadow-md w-96 space-y-4"
      >
        <h2 className="text-white text-2xl font-bold text-center mb-4">
          Register
        </h2>

        {/* username */}
        <div>
          <label htmlFor="username" className="block text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register("username", { required: "Username is required" })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.username && (
            <p className="text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* email */}
        <div>
          <label htmlFor="email" className="block text-gray-700">
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
            className="w-full p-2 border rounded-lg"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* fullName  */}
        <div>
          <label htmlFor="fullName" className="block text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            {...register("fullName", { required: "Full Name is required" })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.fullName && (
            <p className="text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* avatar */}
        <div>
          <label htmlFor="avatar" className="block text-gray-700">
            Avatar{" "}
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
            className="w-full p-2 border rounded-lg"
          />
          {errors.avatar && (
            <p className="text-red-500">{errors.avatar.message}</p>
          )}
        </div>

        {/* cover image  */}
        <div>
          <label htmlFor="coverImage" className="block text-gray-700">
            Cover Image
          </label>
          <input
            id="coverImage"
            type="file"
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
        </div>

        {/* password */}
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg"
        >
           {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
