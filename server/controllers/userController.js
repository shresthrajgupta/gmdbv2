import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import Game from '../models/gameModel.js'; // do not remove

import asyncHandler from "../utils/asyncHandler.js";

import generateToken from "../utils/generateToken.js";
import mailerGmail from "../utils/mailerGmail.js";

dotenv.config();

const runningEnv = process.env.NODE_ENV;


const signup = asyncHandler(async (req, res) => {
    const { name, password, email } = req.body;

    const userExists = await User.exists({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    try {
        await mailerGmail({
            from: process.env.EMAIL_ID,
            to: email,
            subject: "OTP",
            text: `Your OTP is ${otp}`,
        });
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("signup", err);
        }
        res.status(500);
        throw new Error("Failed to send OTP");
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedOtp = await bcrypt.hash(`${otp}`, salt);

        const payload = { email, name, hashedPassword, hashedOtp, attempts: 1 };
        generateToken(res, { ...payload, purpose: "auth" });

        return res.status(200).json("OTP sent successfully");
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("signup", err);
        }
        res.status(500);
        throw new Error("Failed to register user, please try again");
    }
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const token = req.cookies.jwt;

    if (!token) {
        res.status(401);
        throw new Error("Token verification failed. Please start registration again");
    }

    if (!otp) {
        res.status(400);
        throw new Error("OTP is required");
    }

    if (otp.length !== 6 || (parseInt(otp) < 100000 || parseInt(otp) > 999999)) {
        res.status(400);
        throw new Error("Please enter a valid OTP");
    }

    let decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "auth") {
        res.status(401);
        throw new Error("Invalid verification token");
    }

    if (Date.now() > new Date(decoded.exp * 1000)) {
        res.clearCookie("jwt");
        res.status(400)
        throw new Error("Verification session expired. Please start registration again.");
    }

    if (Number(decoded.attempts) >= 3) {
        res.clearCookie("jwt");
        res.status(400)
        throw new Error("Maximum OTP attempts exceeded. Please try again later");
    }

    try {
        const isOTPValid = await bcrypt.compare(`${otp}`, `${decoded.hashedOtp}`);;
        if (!isOTPValid) {
            const { exp, iat, ...rest } = decoded;
            decoded = { ...rest, attempts: decoded.attempts + 1 };
            generateToken(res, decoded);

            return res.status(400).json({
                message: "Invalid OTP",
                attemptsLeft: 4 - decoded.attempts
            });
        }

        const user = await User.findOne({ email: decoded.email }); // do not use lean if you want to use .save() later

        if (!user) {
            const newUser = new User({
                name: decoded.name,
                email: decoded.email,
                password: decoded.hashedPassword
            });
            await newUser.save();

            res.clearCookie("jwt");
            generateToken(res, { userId: newUser._id, purpose: "access" });

            return res.status(201).json({ _id: newUser._id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin });
        }
        else {
            user.password = decoded.hashedPassword;
            await user.save();

            res.clearCookie("jwt");
            generateToken(res, { userId: user._id, purpose: "access" });

            return res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
        }
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("verifyOtp", err);
        }
        res.status(500);
        throw new Error("Server error, failed to verify OTP");
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email }).lean();

    if (user && (await bcrypt.compare(`${password}`, `${user.password}`))) {
        generateToken(res, { userId: user._id, purpose: "access" });
        res.status(200).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.exists({ email });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    try {
        await mailerGmail({
            from: process.env.EMAIL_ID,
            to: email,
            subject: "OTP",
            text: `Your OTP is ${otp}`,
        });
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("forgotPassword", err);
        }
        res.status(500);
        throw new Error("Failed to send OTP");
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedOtp = await bcrypt.hash(`${otp}`, salt);

        const payload = { email, hashedPassword, hashedOtp, attempts: 1 };
        generateToken(res, { ...payload, purpose: "auth" });


        return res.status(200).json("OTP sent successfully");
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("forgotPassword", err);
        }
        res.status(500);
        throw new Error("Some error occured, please try again");
    }
});

const homepageGames = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    try {
        const toPlayGames = await User.findById(userId, 'toPlay').populate({ path: "toPlay", select: "name guid poster url", options: { limit: 8 } }).lean();
        return res.status(200).json(toPlayGames);
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("homepageGames", err);
        }
        res.status(500);
        throw new Error("Server err, Failed to fetch homepage games");
    }
});

const getProfile = asyncHandler(async (req, res, next) => {
    try {
        const profile = { ...req.user._doc };
        delete profile._id;
        delete profile.isAdmin;
        delete profile.password;

        return res.json(profile);

    } catch (err) {
        res.status(500);
        throw new Error("Error fetching profile");
    }
});

const addToPlaylist = asyncHandler(async (req, res) => {
    const gameId = req.body.gameId;
    const userId = req.user._id.toString();

    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
        res.status(400);
        throw new Error("Invalid game ID");
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId).select('toPlay finished').lean();

    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }

    if (!user.toPlay) {
        user.toPlay = [];
    }

    if (user.toPlay.some(id => id.equals(gameId))) {
        res.status(400);
        throw new Error("Game already exists in playlist");
    }

    try {
        if (user.finished.some(id => id.equals(gameId))) {
            await User.findByIdAndUpdate(userId, {
                $pull: { finished: gameId },
                $push: { toPlay: gameId }
            });
        } else {
            await User.findByIdAndUpdate(userId, { $push: { toPlay: gameId } });
        }

        return res.status(200).json("Added to playlist");
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("addToPlaylist error", err);
        }
        res.status(500);
        throw new Error("Error adding game into playlist");
    }
});

const delFromPlaylist = asyncHandler(async (req, res) => {
    const gameId = req.body.gameId;
    const userId = req.user._id.toString();

    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
        res.status(400);
        throw new Error("Invalid game ID");
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId).select('toPlay').lean();

    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }

    if (!user.toPlay.some(id => id.equals(gameId))) {
        res.status(400);
        throw new Error("Game does not exist in playlist");
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { toPlay: gameId } });
        return res.status(200).json("Removed from playlist");
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("delFromPlaylist error", err);
        }
        res.status(500);
        throw new Error("Error in deleting game from playlist");
    }
});

const addToCompletedList = asyncHandler(async (req, res) => {
    const gameId = req.body.gameId;
    const userId = req.user._id;

    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
        res.status(400);
        throw new Error("Invalid game ID");
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId).select("toPlay finished").lean();

    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }

    if (!user.finished) {
        user.finished = [];
    }

    if (user.finished.some(id => id.equals(gameId))) {
        res.status(400);
        throw new Error("Game already exists in completed list");
    }

    try {
        if (user.toPlay.some(id => id.equals(gameId))) {
            await User.findByIdAndUpdate(userId, {
                $pull: { toPlay: gameId },
                $push: { finished: gameId }
            });
        } else {
            await User.findByIdAndUpdate(userId, { $push: { finished: gameId } });
        }

        return res.status(200).json("Added to completed list");
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("addToCompletedList error", err);
        }
        res.status(500);
        throw new Error("Error in adding game into completed list");
    }
});

const delFromCompletedList = asyncHandler(async (req, res) => {
    const gameId = req.body.gameId;
    const userId = req.user._id;

    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
        res.status(400);
        throw new Error("Invalid game ID");
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId).select('finished').lean();

    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }

    if (!user.finished.some(id => id.equals(gameId))) {
        res.status(400);
        throw new Error("Does not exist in completed list");
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { finished: gameId } });
        return res.status(200).json("Removed from completed list");
    } catch (err) {
        if (runningEnv !== "production") {
            console.error("delFromCompletedList error", err);
        }
        res.status(500);
        throw new Error("Error in deleting game from completed list");
    }
});

const showPlaylist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    const pageNo = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (pageNo - 1) * limit;

    const [userPopulated, gameCount] = await Promise.all([
        User.findById(userId).select('toPlay').populate({ path: "toPlay", select: "name id guid poster url", options: { limit: limit, skip: skip } }).lean(),
        User.findById(userId).select('toPlay').lean().then(user => user?.toPlay?.length || 0)
    ]);

    const totalCount = Math.ceil(gameCount / limit);

    if (!userPopulated) {
        res.status(404);
        throw new Error("User not found");
    }

    if (pageNo <= 0 || pageNo > totalCount) {
        res.status(404);
        throw new Error("Page out of limits");
    }

    userPopulated.totalPages = totalCount;

    res.status(200).json({ _id: userPopulated._id, toPlay: userPopulated.toPlay, totalPages: totalCount });
});

const showCompletedList = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    const pageNo = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (pageNo - 1) * limit;

    const [userPopulated, gameCount] = await Promise.all([
        User.findById(userId).select('finished').populate({ path: "finished", select: "name id guid poster url", options: { limit: limit, skip: skip } }).lean(),
        User.findById(userId).select('finished').lean().then(user => user?.finished?.length || 0)
    ]);

    const totalCount = Math.ceil(gameCount / limit);

    if (!userPopulated) {
        res.status(404);
        throw new Error("User not found");
    }

    if (pageNo <= 0 || pageNo > totalCount) {
        res.status(404);
        throw new Error("Page out of limits");
    }

    userPopulated.totalPages = totalCount;

    res.status(200).json({ _id: userPopulated._id, finished: userPopulated.finished, totalPages: totalCount });
});



export {
    signup,
    verifyOtp,
    login,
    forgotPassword,
    homepageGames,
    getProfile,
    addToPlaylist,
    delFromPlaylist,
    addToCompletedList,
    delFromCompletedList,
    showPlaylist,
    showCompletedList
};