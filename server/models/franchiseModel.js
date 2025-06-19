import mongoose from "mongoose";
const { Schema } = mongoose;

const franchiseSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    deck: { type: String, default: "null" },
    games: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    guid: { type: String, required: true },
    id: { type: Number, required: true },
    poster: { type: String },
}, { timestamps: true });

const Franchise = mongoose.model("Franchise", franchiseSchema);
export default Franchise;