import jwt from 'jsonwebtoken';

import asyncHandler from '../utils/asyncHandler.js';

import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const { userId } = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(userId).select('name email password isAdmin');
            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not authorized, token verification failed.');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token. Please Log in again');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

export { protect, admin };