import express from 'express';

import { protect, admin } from '../middlewares/authMiddleware.js';

import { getRating, postRating } from '../controllers/ratingController.js';

const router = express.Router();


router.route('/:gameId').get(protect, getRating);
router.route('/').post(protect, postRating);


export default router;