import mongoose from "mongoose";
const { Schema } = mongoose;

const ratingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    score: { type: Number, min: 0, max: 5, required: true }
}, { timestamps: true });

ratingSchema.index({ user: 1, game: 1 }, { unique: true }); // Ensure one rating per user per game

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
