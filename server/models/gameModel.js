import mongoose from "mongoose";
const { Schema } = mongoose;

const gameSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    deck: { type: String, default: "null" },
    expected_release_day: { type: String, default: "null" },
    expected_release_month: { type: String, default: "null" },
    expected_release_year: { type: String, default: "null" },
    guid: { type: String, required: true },
    id: { type: Number, required: true },
    poster: { type: String },
    original_game_rating: [{ type: String, default: "null" }],
    original_release_date: { type: String, default: "null" },
    platforms: [{ type: String }],
    developers: [{ type: String }],
    franchises: [{ type: Schema.Types.ObjectId, ref: "Franchise" }],
    genres: [{ type: String }],
    publishers: [{ type: String }],
    dlcs: [{ type: String }],
    similar_games: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    themes: [{ type: String }],

}, { timestamps: true });

const Game = mongoose.model("Game", gameSchema);
export default Game;