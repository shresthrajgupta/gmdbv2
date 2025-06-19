import mongoose from "mongoose";

import Rating from "../models/ratingModel.js";

const runningEnv = process.env.NODE_ENV;

const postRating = async (req, res, next) => {
    const userId = req.user._id.toString();
    const gameId = req.body.gameId;
    const score = req.body.score;

    if (!userId || !gameId || score === undefined || score === null || score < 0 || score > 5) {
        res.status(400);
        throw new Error("Invalid user or rating");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid User ID");
    }

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        res.status(400);
        throw new Error("Invalid Game ID format");
    }

    try {
        await Rating.findOneAndUpdate(
            {
                user: userId,
                game: gameId
            },
            {
                score: score
            },
            {
                upsert: true,  // Create if doesn't exist
                runValidators: true  // Run schema validators
            }
        );

        return res.status(200).json("Rating updated successfully");

    } catch (err) {
        if (runningEnv !== "production") {
            console.log("postRating error", err);
        }
        res.status(500);
        throw new Error("Error updating rating");
    }
};

const getRating = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const gameId = req.query.gameId;

        if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
            res.status(400);
            throw new Error("Invalid game ID");
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400);
            throw new Error("Invalid user ID");
        }

        const [result] = await Rating.aggregate([
            { $match: { game: mongoose.Types.ObjectId.createFromHexString(gameId) } },
            {
                $facet: {
                    aggregate: [
                        {
                            $group: {
                                _id: null,
                                avg: { $avg: "$score" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    userRating: [
                        { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId) } },
                        { $limit: 1 },
                        { $project: { _id: 0, score: 1 } }
                    ]
                }
            },
            {
                $project: {
                    avg: { $ifNull: [{ $arrayElemAt: ["$aggregate.avg", 0] }, 0] },
                    count: { $ifNull: [{ $arrayElemAt: ["$aggregate.count", 0] }, 0] },
                    userRating: { $ifNull: [{ $arrayElemAt: ["$userRating.score", 0] }, 0] }
                }
            }
        ]);

        const avgRating = result.avg;
        const countRating = result.count;
        const userRating = result.userRating;


        return res.status(200).json({
            average: avgRating, user: userRating, count: countRating
        });

    } catch (err) {
        if (runningEnv !== "production") {
            console.error("getRating error", err);
        }
        res.status(500);
        throw new Error("Error fetching rating");
    }
};

export { getRating, postRating };