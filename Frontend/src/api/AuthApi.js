import axios from "axios";

// const API_URL = "http://localhost:8000/api/v1/users";
// const API_URL = "https://youtube-ydae.onrender.com/api/v1/users";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1/users"  // Local backend
    : "https://youtube-ydae.onrender.com/api/v1/users";  // Deployed backend


// Create an Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Ensure cookies are sent
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If refresh token request itself fails, log out user
    if (originalRequest.url.includes("/refresh-token")) {
      console.log("Refresh token failed, logging out...");
      return Promise.reject(error);
    }

    // If token expired and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Token expired, refreshing token...");
        const newToken = await refreshToken();
        if (newToken) {
          // Update the original request's headers
          console.log("Token refreshed, retrying original request...");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest); // Retry with new token
        }
        console.log("Token refresh failed, rejecting request...");
        return Promise.reject(error);
      } catch (refreshError) {
        console.log("Token refresh error:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Get Current User

export const getCurrentUser = async () => {
  try {
    // const response = await axios.get(`${API_URL}/current-user`, {
    //   withCredentials: true,
    // });
    const response = await api.get(`/current-user`);
    console.log("Api getCurrentuser resposne", response.data);
    return response.data;
  } catch (error) {
    return null; // No user logged in
  }
};

// Refresh Token Function
export const refreshToken = async () => {
  try {
    const res = await api.post("/refresh-token");
    console.log("refreshhhhhhhhhhhhhhhhhhhhhhhh :", res);
    const newAccessToken = res.data?.data?.accessToken;
    
    if (newAccessToken) {
      // Update axios default headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      return newAccessToken;
    }
    return false;
  } catch (error) {
    console.error("Refresh token request failed:", error);
    return false;
  }
};

// Login API
export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData, {
      withCredentials: true, // Ensures cookies (JWT) are handled properly
    });
    console.log("loginnnnnnnn",response.data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

// Register API
export const register = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, formData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Axios error response:", error.response?.data);
    console.log("Axios full error:", error);
    
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

// Verify OTP API
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "OTP verification failed",
    };
  }
};


export const resendOtp = async (email) => {
  try {
    console.log("resendOPTP email",email)
    const response = await axios.post(`${API_URL}/resendOtp`, { email });
    console.log("resendOPTP",response)
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to resend OTP.";
  }
};

export const changePassword = async ({oldPassword, newPassword}) => {
  try {
    const response = await api.post(`/change-password`, {oldPassword, newPassword});
    console.log("change password: ", response);
    return response.data;
  } catch (error) {
    // More consistent error handling
    throw error.response?.data?.message || 
          error.message || 
          "Failed to change password";
  }
};

// Logout API
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, 
      {
         withCredentials: true,
         headers: {
          Authorization: api.defaults.headers.common["Authorization"], 
        } 
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};


// ✅ Send OTP for password reset
export const sendResetOtp = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/send-reset-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to send OTP.";
  }
};

// ✅ Verify OTP
export const verifyResetOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-reset-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Invalid OTP.";
  }
};

// ✅ Reset Password
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { email, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Password reset failed.";
  }
};
// Get User Channel Profile
// export const getUserChannelProfile = async (username) => {
//   try {
//     const response = await api.get(`/c/${username}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching user channel profile:", error);
//     return {
//       success: false,
//       message: error.response?.data?.message || "Failed to fetch user profile",
//     };
//   }
// };

export const getUserChannelProfile = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/c/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user channel profile:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch user profile",
    };
  }
};

// AuthApi.js

// Update Avatar
export const updateAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.patch("/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("avatar res",response)

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update avatar",
    };
  }
};

// Update Cover Image
export const updateCoverImage = async (coverImageFile) => {
  try {
    const formData = new FormData();
    formData.append("coverImage", coverImageFile);

    const response = await api.patch("/cover-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("cover image res",response)

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update cover image",
    };
  }
};

// Update Account Details
export const updateUserAccountDetails = async (accountData) => {
  try {
    const response = await api.patch("/update-account", accountData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update account details",
    };
  }
};