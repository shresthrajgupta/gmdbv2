import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();


const generateToken = (res, payload) => {
    const token = jwt.sign({ ...payload }, process.env.JWT_SECRET, {
        expiresIn: (payload?.purpose === "access" ? "1d" : "10m")
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: (payload?.purpose === "access" ? (24 * 60 * 60 * 1000) : (10 * 60 * 1000)) // 1 day or 10 min
    });

    return token;
};

export default generateToken;