import mongoose from "mongoose";

const UserInteractionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    videoId: { type: String, required: true },
    watched: { type: Boolean, default: false },
    liked: { type: Boolean, default: false },
    subscribed: { type: Boolean, default: false }
});

export default mongoose.model("UserInteraction", UserInteractionSchema);
