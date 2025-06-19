import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';

import asyncHandler from "../utils/asyncHandler.js";

import Game from '../models/gameModel.js';
import Franchise from "../models/franchiseModel.js";
import User from '../models/userModel.js';

dotenv.config();

const apikey = process.env.GIANTBOMB_API;
const runningEnv = process.env.NODE_ENV;


const gameSearch = asyncHandler(async (req, res) => {
    const gameName = req.params.game;

    if (!gameName || !gameName.trim()) {
        res.status(400);
        throw new Error("Query required");
    }

    const encodedGame = encodeURIComponent(gameName.trim());
    const apicall = `http://www.giantbomb.com/api/search/?api_key=${apikey}&format=json&query=${encodedGame}&resources=game&field_list=name,guid,id`;
    const doc = await axios.get(apicall).then(response => response.data);

    if (!doc || doc.status_code !== 1) {
        res.status(400);
        throw new Error("Bomb error, please try again using a different query");
    }

    try {
        const games = doc.results;

        games.map((game) => {
            const url = `/game/guid/${game.guid}`;
            game.url = url;
        });

        return res.status(200).json(games);
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("gameSearch error", err);
        }
        res.status(500);
        throw new Error("Error searching game");
    }
});

const getGameDetail = asyncHandler(async (req, res) => {
    const mainGuid = req.params.guid;
    const userId = req.user._id;


    if (!mainGuid || !mainGuid.trim()) {
        res.status(400);
        throw new Error("Guid required")
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    const mainGame = await Game.findOne({ guid: mainGuid }).populate("franchises", "name id guid url").populate("similar_games", "name id guid url").lean();

    if (mainGame && mainGame.deck !== "null") {
        try {
            const result = await User.aggregate([
                { $match: { _id: userId } },
                {
                    $project: {
                        isPlaying: { $in: [mainGame._id, "$toPlay"] },
                        isCompleted: { $in: [mainGame._id, "$finished"] }
                    }
                }
            ]);

            mainGame.isPlaying = result[0].isPlaying;
            mainGame.isCompleted = result[0].isCompleted;

            return res.status(200).json(mainGame);
        } catch (err) {
            if (runningEnv !== "production") {
                console.error("getGameDetail error", err);
            }
            res.status(500);
            throw new Error("Error fetching game details db");
        }
    } else {
        try {
            const apicall = `https://www.giantbomb.com/api/game/${mainGuid}/?api_key=${apikey}&format=json&field_list=name,deck,expected_release_day,expected_release_month,expected_release_year,guid,id,original_game_rating,original_release_date,platforms,developers,franchises,genres,publishers,dlcs,similar_games,themes,image`;
            const doc = await axios.get(apicall).then(response => response.data);

            if (doc.status_code !== 1) {
                res.status(400);
                throw new Error("Bomb error, fetching game details failed");
            }

            const data = doc.results;

            const gameData = {
                name: data.name,
                url: `/game/guid/${data.guid}`,
                deck: data.deck,
                expected_release_day: data.expected_release_day,
                expected_release_month: data.expected_release_month,
                expected_release_year: data.expected_release_year,
                guid: data.guid,
                id: data.id,
                poster: data.image.small_url,
                original_game_rating: data.original_game_rating?.map(rating => rating.name),
                original_release_date: data.original_release_date,
                platforms: data.platforms?.map(platform => platform.name),
                developers: data?.developers?.map(developer => developer.name),
                genres: data?.genres?.map(genre => genre.name),
                publishers: data?.publishers?.map(publisher => publisher.name),
                dlcs: [...new Set(data.dlcs?.map(dlc => dlc.name))],
                themes: data?.themes?.map(theme => theme.name)
            }

            // filling franchises in .franchises
            const franchiseData = data.franchises?.map(f => {
                const arr = f.api_detail_url.split("/");
                const guid = arr[arr.length - 2];
                return {
                    name: f.name,
                    id: f.id,
                    guid,
                    url: `/franchise/guid/${guid}`
                };
            }) || [];

            // Use bulkWrite for efficient upserts
            const franchisebulkOps = franchiseData.map(f => ({
                updateOne: {
                    filter: { guid: f.guid },
                    update: { $setOnInsert: f },
                    upsert: true
                }
            }));

            await Franchise.bulkWrite(franchisebulkOps);
            const franchiseArr = await Franchise.find({
                guid: { $in: franchiseData.map(f => f.guid) }
            }).lean();

            gameData.franchises = franchiseArr;



            // filling games in .similar_games
            const similarGameData = data.similar_games?.map(g => {
                const arr = g.api_detail_url.split("/");
                const guid = arr[arr.length - 2];
                return {
                    name: g.name,
                    id: g.id,
                    guid,
                    url: `/game/guid/${guid}`
                };
            }) || [];

            // Use bulkWrite for efficient upserts
            const similarGamebulkOps = similarGameData.map(g => ({
                updateOne: {
                    filter: { guid: g.guid },
                    update: { $setOnInsert: g },
                    upsert: true
                }
            }));

            await Game.bulkWrite(similarGamebulkOps);
            const similarGamesArr = await Game.find({
                guid: { $in: similarGameData.map(g => g.guid) }
            }).lean();

            gameData.similar_games = similarGamesArr;



            const currGame = await Game.findOneAndUpdate({ guid: mainGuid }, gameData, { upsert: true, new: true })
                .populate("franchises", "name id guid url").populate("similar_games", "name id guid url").lean();



            const resultFinal = await User.aggregate([
                { $match: { _id: userId } },
                {
                    $project: {
                        isPlaying: { $in: [currGame._id, "$toPlay"] },
                        isCompleted: { $in: [currGame._id, "$finished"] }
                    }
                }
            ]);

            currGame.isPlaying = resultFinal[0].isPlaying;
            currGame.isCompleted = resultFinal[0].isCompleted;

            return res.status(200).json(currGame);
        } catch (err) {
            if (runningEnv !== "production") {
                console.error("getGameDetail error", err);
            }
            res.status(500);
            throw new Error("Error fetching game details api");
        }
    }
});

export { gameSearch, getGameDetail };