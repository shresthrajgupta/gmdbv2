import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    toPlay: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    finished: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;