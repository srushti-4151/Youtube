import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    tCommnent: {
      type: Schema.Types.ObjectId,
      ref: "TweetComment",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: { 
        type: String, 
        enum: ["like", "dislike"], 
        required: true 
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
