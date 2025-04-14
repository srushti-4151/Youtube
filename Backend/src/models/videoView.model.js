import mongoose, { Schema } from "mongoose";

const videoViewSchema = new Schema(
  {
    video: { 
      type: Schema.Types.ObjectId, 
      ref: "Video", 
      required: true 
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Null if guest
    guestId: { type: String, default: null }, // Hashed for unauthenticated users
    watchHistory: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VideoView = mongoose.model("VideoView", videoViewSchema);
