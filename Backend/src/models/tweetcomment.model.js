import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetcommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

tweetcommentSchema.plugin(mongooseAggregatePaginate);

export const TweetComment = mongoose.model("TweetComment", tweetcommentSchema);