import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
        index: true,
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User",
        index: true,
    }
}, {timestamps: true})

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema)