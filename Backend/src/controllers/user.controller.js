import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
import { EMAIL_VERIFY_TEMPLATE } from "../utils/EmailTemp.js";
import transporter from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

// 1. User Logs In = The frontend sends email & password to the backend
// 2. Backend generates Access (used for API requests) & Refresh ( stored in an HTTP-only cookie) Toekns
// 3. Backend stores Refresh Token in an HTTP-only cookie and sends the Access  Token in the response
// 4. The frontend sends API requests using the Access Token in headers: Authorization: Bearer access_token
// The server verifies the Access Token and responds with the requested data
// 5. Access Token Expires (401 unauthorized) -The frontend automatically sends a request for new access token
// The browser automatically includes the Refresh Token (HTTP-only cookie) in this request
// 6. Backend Verifies Refresh Token & Issues a New Access Token
// The server retrieves the Refresh Token from the cookie.
// --> It checks the database if the token is valid:
// -If valid: Generate a new Access Token and send it to the frontend.
// -If invalid/expired: Reject the request (user must log in again).
// 7. The frontend saves the new Access Token and retries the original request
// In `user.controller.js`
export const deleteUnverifiedUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndDelete({ 
    email,
    isAccountVerified: false // Only delete if unverified
  });

  if (!user) {
    throw new ApiError(404, "User not found or already verified");
  }

  // Cleanup: Delete avatar/coverImage from Cloudinary
  if (user.avatar) await deleteFromCloudinary(user.avatar);
  if (user.coverImage) await deleteFromCloudinary(user.coverImage);

  return res.status(200).json(
    new ApiResponse(200, {}, "Unverified user deleted")
  );
});
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if OTP is valid
    if (!user.verifyOtp || user.verifyOtp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (!user.verifyOtpExpireAt || new Date(user.verifyOtpExpireAt) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark the user as verified
    user.isAccountVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpireAt = null;
    await user.save();

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully!"));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    const otpExpireTime = Date.now() + 3 * 60 * 1000; // Expires in 15 minutes

    // Save OTP in the database
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpireTime;
    await user.save();

    // Send OTP to email
    await transporter.sendMail(
      {
        from: process.env.SENDER_EMAIL_ID,
        to: email,
        subject: "Your Verification OTP",
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 3 minutes.</p>`,
      },
      (error, info) => {
        if (error) {
          console.log("Email sending error:", error);
        } else {
          console.log("Email sent successfully:", info.response);
        }
      }
    );
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent successfully"));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  // console.log("Uploaded files:", req.files);
  // console.log("Request body:", req.body);

  const { fullName, email, username, password } = req.body;
  // console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //console.log("-----------------re.files :", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //console.log("Avatar Upload Response: ", avatar);
  //console.log("Cover Image Upload Response: ", coverImage);

  if (!avatar?.url) {
    throw new ApiError(400, "Avatar file is required");
  }
  // console.log("User Data:", { fullName, email, username, password, otp, otpExpireTime });

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  await sendOtp({ body: { email: user.email } }, res);
  // console.log("OTP sent to:", user.email);


  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered SuccessfullyCheck your email for verification OTP."));
});

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json(new ApiResponse(200, {}, "Email is required"));
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    // ✅ Prevent sending OTP if user is already verified
    if (user.isAccountVerified) {
      return res.status(400).json({ message: "Account is already verified. No need to resend OTP." });
    }

    // ✅ Generate a 6-digit OTP safely
    const otp = crypto.randomInt(100000, 999999).toString().padStart(6, '0');
    
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes
    await user.save();

    // ✅ Send OTP email using a proper template
    const emailBody = EMAIL_VERIFY_TEMPLATE.replace("{{email}}", email).replace("{{otp}}", otp);

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL_ID,
      to: email,
      subject: "New Verification OTP",
      html: emailBody,
    });

    return res.status(200).json(new ApiResponse(200, {}, "New OTP sent to email"));
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(); //method we made in model file
    const refreshToken = user.generateRefreshToken(); //method we made in model file

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // all required filed no need bcz we only need to save rfresh token 

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and referesh token
  // send cookie

  const { email, username, password } = req.body;
  console.log(email);

  if (!(username || email)) { //!username && !email
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }], // email or username
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password); //method we made in model file

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

   // **Check if user already has a refresh token, then invalidate it**
   if (user.refreshToken) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  //sending and setting tokens
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //cookies 
  const options = {
    httpOnly: true, // // Prevents JavaScript access only server(backend) can modify
    secure: true,// Sends only over HTTPS
    sameSite: "None",
  };

  // Only refreshToken is stored in a cookie (httpOnly, secure)
  // Access token is returned in JSON (not stored in a cookie)
  return res
    .status(200)
    // .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { //we sending this both token in res (not recommended) because ma be user want to handle in frontend  
          user: loggedInUser,
          accessToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // here this req.user access coming from midlleware 
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,  //to get values that returned after update 
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

//To giive new accesstoken
const refreshAccessToken = asyncHandler(async (req, res) => {
  //get incoming refresh token from fontend
  // decode it 
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

    // console.log("incomming....", incomingRefreshToken)
   

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // console.log("decoded....",decodedToken)

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Invalidate old refresh token before generating new one
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    };

    // Generate new tokens (this function will save the new refresh token)
    const { accessToken, refreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      // .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          // { accessToken, refreshToken: refreshToken },
          { accessToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => { //middleware me user inject kiya tha
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true } //to get values that returned after update 
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
  }

   const existingUser = await User.findById(req.user?._id);
   if (!existingUser) {
       throw new ApiError(404, "User not found");
   }

   // Delete the existing avatar from Cloudinary 
   if (existingUser.avatar) {
       await deleteFromCloudinary(existingUser.avatar);
       console.log("Old avatar deleted from Cloudinary");
   }

   // Upload new avatar on Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

  console.log("user........", req.user);
  console.log("user id.......", req.user._id);

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              avatar: avatar.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
  )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing")
  }

  const existingUser = await User.findById(req.user?._id);
  if (!existingUser) {
      throw new ApiError(404, "User not found");
  }

  // Delete the existing cover image from Cloudinary 
  if (existingUser.coverImage) {
      await deleteFromCloudinary(existingUser.coverImage);
      console.log("🗑️ Old cover image deleted from Cloudinary");
  }

  // Upload new cover image to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              coverImage: coverImage.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Cover image updated successfully")
  )
})



//old one with jwt verfy
// const getUserChannelProfile = asyncHandler(async(req, res) => {
//   // console.log("reqqqqqqqq",req.user?._id)
//   const {username} = req.params

//   if (!username?.trim()) {
//       throw new ApiError(400, "username is missing")
//   }

//   const channel = await User.aggregate([
//       {
//           $match: {
//               username: username?.toLowerCase()
//           }
//       },
//       {
//           $lookup: {
//               from: "subscriptions", //Subscription
//               localField: "_id",
//               foreignField: "channel",
//               as: "subscribers"
//           }
//       },
//       {
//           $lookup: {
//               from: "subscriptions",
//               localField: "_id",
//               foreignField: "subscriber",
//               as: "subscribedTo"
//           }
//       },
//       //Since $lookup returns an array, we use $addFields to extract the first element and store it as a normal object.
//       {
//           $addFields: {
//               subscribersCount: {
//                   $size: "$subscribers"
//               },
//               channelsSubscribedToCount: {
//                   $size: "$subscribedTo"
//               },
//               isSubscribed: {
//                   $cond: {
//                       if: {$in: [req.user?._id, "$subscribers.subscriber"]},
//                       then: true,
//                       else: false
//                   }
//               }
//           }
//       },
//       {
//           $project: {
//               fullName: 1,
//               username: 1,
//               subscribersCount: 1,
//               channelsSubscribedToCount: 1,
//               isSubscribed: 1,
//               avatar: 1,
//               coverImage: 1,
//               email: 1

//           }
//       }
//   ])

//   console.log("channel: ",channel);

//   if (!channel?.length) {
//       throw new ApiError(404, "channel does not exists")
//   }

//   return res
//   .status(200)
//   .json(
//       new ApiResponse(200, channel[0], "User channel fetched successfully")
//   )
// })

const getUserChannelProfile = asyncHandler(async(req, res) => {
  const {username} = req.params

  if (!username?.trim()) {
      throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
      {
          $match: {
              username: username?.toLowerCase()
          }
      },
      {
          $lookup: {
              from: "subscriptions", //Subscription
              localField: "_id",
              foreignField: "channel",
              as: "subscribers"
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo"
          }
      },
      {
        $lookup: {
          from: "videos", // Assuming your videos collection is named 'videos'
          localField: "_id",
          foreignField: "owner", // The field in 'videos' that references 'User' (_id)
          as: "videos",
        },
      },
      //Since $lookup returns an array, we use $addFields to extract the first element and store it as a normal object.
      {
          $addFields: {
              subscribersCount: {
                  $size: "$subscribers"
              },
              channelsSubscribedToCount: {
                  $size: "$subscribedTo"
              },
              totalVideos: { 
                $size: "$videos" 
              },
          }
      },
      {
          $project: {
              fullName: 1,
              username: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              avatar: 1,
              coverImage: 1,
              totalVideos: 1,
              email: 1

          }
      }
  ])

  // console.log("channel: ",channel);

  if (!channel?.length) {
      throw new ApiError(404, "channel does not exists")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
  )
})

// const getUserChannelProfile = asyncHandler(async (req, res) => {
//   const { username } = req.params;
//   const loggedInUserId = req.user?._id || null; // Get user ID if logged in

//   if (!username || !username.trim()) {
//     throw new ApiError(400, "Username is missing");
//   }

//   const channel = await User.aggregate([
//     {
//       $match: {
//         username: username.toLowerCase(),
//       },
//     },
//     {
//       $lookup: {
//         from: "subscriptions",
//         localField: "_id",
//         foreignField: "channel",
//         as: "subscribers",
//       },
//     },
//     {
//       $lookup: {
//         from: "subscriptions",
//         localField: "_id",
//         foreignField: "subscriber",
//         as: "subscribedTo",
//       },
//     },
//     {
//       $addFields: {
//         subscribersCount: {
//           $size: "$subscribers",
//         },
//         channelsSubscribedToCount: {
//           $size: "$subscribedTo",
//         },
//         isSubscribed: loggedInUserId
//           ? {
//               $in: [loggedInUserId, "$subscribers.subscriber"],
//             }
//           : "$$REMOVE", // Remove isSubscribed if user is not logged in
//       },
//     },
//     {
//       $project: {
//         fullName: 1,
//         username: 1,
//         subscribersCount: 1,
//         channelsSubscribedToCount: 1,
//         avatar: 1,
//         coverImage: 1,
//         email: 1,
//         isSubscribed: loggedInUserId ? 1 : 0, // Include isSubscribed only if user is logged in
//       },
//     },
//   ]);

//   if (!channel.length) {
//     throw new ApiError(404, "Channel does not exist");
//   }

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, channel[0], "User channel fetched successfully")
//     );
// });

//waant videos first then also owner data(owner who is also user thats why nested lookup)
const getWatchHistory = asyncHandler(async(req, res) => {
  const user = await User.aggregate([
      {
          $match: {
              _id: new mongoose.Types.ObjectId(req.user._id)
          }
      },
      {
          $lookup: {
              from: "videos",
              localField: "watchHistory",
              foreignField: "_id",
              as: "watchHistory",
              pipeline: [
                  {
                      $lookup: {
                          from: "users",
                          localField: "owner",
                          foreignField: "_id",
                          as: "owner",
                          pipeline: [
                              {
                                  $project: {
                                      fullName: 1,
                                      username: 1,
                                      avatar: 1
                                  }
                              }
                          ]
                      }
                  },
                  {
                      $addFields:{
                          owner:{
                              $first: "$owner"
                          }
                      }
                  }
              ]
          }
      }
  ])

  return res
  .status(200)
  .json(
      new ApiResponse(
          200,
          user[0].watchHistory,
          "Watch history fetched successfully"
      )
  )
})



//  1. Send OTP for Password Reset
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP & Expiry Time
    const otp = crypto.randomInt(100000, 999999).toString(); 
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 3 * 60 * 1000; // Expires in 3 minutes
    await user.save();

    // Send OTP via Email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL_ID,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 3 minutes.</p>`,
    });

    return res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//  2. Verify OTP
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate OTP
    if (!user.resetOtp || user.resetOtp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.resetOtpExpireAt || new Date(user.resetOtpExpireAt) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Clear OTP fields
    user.resetOtp = null;
    user.resetOtpExpireAt = null;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//  3. Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: "Email and new password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    // Hash new password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // user.password = hashedPassword;

    // Clear OTP fields if not already cleared
    user.resetOtp = null;
    user.resetOtpExpireAt = null;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//  4. Resend OTP
export const resendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a new OTP
    const otp = crypto.randomInt(100000, 999999).toString(); 
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 3 * 60 * 1000; // Expires in 3 minutes
    await user.save();

    // Send OTP via Email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL_ID,
      to: email,
      subject: "New Password Reset OTP",
      html: `<p>Your new OTP is <strong>${otp}</strong>. It expires in 3 minutes.</p>`,
    });

    return res.status(200).json(new ApiResponse(200, {}, "New OTP sent successfully"));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
