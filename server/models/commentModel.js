import mongoose from "mongoose";
const { Schema } = mongoose;

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    game: { type: Schema.Types.ObjectId, ref: "Game" },
    text: { type: String, required: true }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;