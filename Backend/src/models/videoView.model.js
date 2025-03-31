import mongoose, { Schema } from "mongoose";

const videoViewSchema = new Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    }, // Null if guest

    guestId: { type: String, default: null }, // Hashed for unauthenticated users
    
    viewedAt: { type: Date, default: Date.now },

    lastWatchedAt: { type: Date, default: Date.now }, // Update when user re-watches
  },
  { timestamps: true }
);

// Create an index for faster queries (get watch history sorted by latest)
videoViewSchema.index({ user: 1, lastWatchedAt: -1 });

export const VideoView = mongoose.model("VideoView", videoViewSchema);
