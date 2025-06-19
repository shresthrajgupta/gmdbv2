import axios from "axios";

import Franchise from "../models/franchiseModel.js";
import Game from "../models/gameModel.js";

import asyncHandler from "../utils/asyncHandler.js";

const apikey = process.env.GIANTBOMB_API;
const runningEnv = process.env.NODE_ENV;


const getFranchiseDetail = asyncHandler(async (req, res) => {
    const mainGuid = req.params.guid;

    if (!mainGuid || !mainGuid.trim()) {
        res.status(400);
        throw new Error("Guid required")
    }

    const mainFranchise = await Franchise.findOne({ guid: mainGuid }).populate("games", "name id guid url").lean();

    if (mainFranchise && mainFranchise.deck !== "null") {
        try {
            return res.status(200).json(mainFranchise);
        } catch (err) {
            if (runningEnv !== "production") {
                console.error("getFranchiseDetail error", err);
            }
            res.status(500);
            throw new Error("Error fetching franchise details db");
        }
    } else {
        const apicall = `https://www.giantbomb.com/api/franchise/${mainGuid}/?api_key=${apikey}&format=json&field_list=deck,games,guid,id,image,name`;

        const doc = await axios.get(apicall).then(response => response.data);

        const statusCode = doc.status_code;
        if (statusCode !== 1) {
            res.status(400);
            throw new Error("Bomb Error, fetching franchise details");
        }

        try {
            const data = doc.results;

            const franchiseData = {
                name: data.name,
                url: `/franchise/guid/${mainGuid}`,
                deck: data.deck,
                guid: mainGuid,
                id: data.id,
                poster: data.image.smallurl
            }

            // filling game in .games
            // let gamesArr = [];
            // for (let i = 0; i < data.games.length; i++) {
            //     const g = data.games[i];

            //     const arr = g.api_detail_url.split("/");
            //     const guid = arr[arr.length - 2];

            //     const cnt = await Game.countDocuments({ guid });

            //     let game;
            //     if (cnt > 0)
            //         game = await Game.findOne({ guid });
            //     else
            //         game = await Game.create({ name: g.name, id: g.id, guid, url: `/game/guid/${guid}` });

            //     gamesArr.push(game);
            // }
            // franchiseData.games = gamesArr;


            // Extract all GUIDs first
            const guids = data.games.map(g => {
                const arr = g.api_detail_url.split("/");
                return arr[arr.length - 2];
            });

            // Single query to find existing games
            const existingGames = await Game.find({ guid: { $in: guids } }).lean();
            const existingGuidsSet = new Set(existingGames.map(game => game.guid));

            // Prepare new games for bulk insert
            const newGamesData = data.games
                .filter(g => {
                    const arr = g.api_detail_url.split("/");
                    const guid = arr[arr.length - 2];
                    return !existingGuidsSet.has(guid);
                })
                .map(g => {
                    const arr = g.api_detail_url.split("/");
                    const guid = arr[arr.length - 2];
                    return {
                        name: g.name,
                        id: g.id,
                        guid,
                        url: `/game/guid/${guid}`
                    };
                });

            // Bulk insert new games
            let newGames = [];
            if (newGamesData.length > 0) {
                newGames = await Game.insertMany(newGamesData);
            }

            // Combine existing and new games
            const allGames = [...existingGames, ...newGames];

            // Create a map for quick lookup and maintain original order
            const gameMap = new Map(allGames.map(game => [game.guid, game]));
            const gamesArr = data.games.map(g => {
                const arr = g.api_detail_url.split("/");
                const guid = arr[arr.length - 2];
                return gameMap.get(guid);
            });

            franchiseData.games = gamesArr;



            // const id = await Franchise.exists({ guid: mainGuid });
            // if (id === null)
            //     await Franchise.create(franchiseData);
            // else
            //     await Franchise.findByIdAndUpdate(id, franchiseData);

            // const currFranchise = await Franchise.findOne({ guid: mainGuid }).populate("games", "name id guid url").exec();

            const currFranchise = await Franchise.findOneAndUpdate(
                { guid: mainGuid },
                franchiseData,
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            ).populate("games", "name id guid url");

            return res.status(200).json(currFranchise);
        } catch (err) {
            if (runningEnv !== "production") {
                console.error("getFranchiseDetail error", err);
            }
            res.status(500);
            throw new Error("Error fetching franchise details api");
        }
    }
});

export { getFranchiseDetail };