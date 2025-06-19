import express from 'express';

import { protect, admin } from '../middlewares/authMiddleware.js';

import { gameSearch, getGameDetail } from '../controllers/gameController.js';

const router = express.Router();

router.route('/:guid').get(protect, getGameDetail);
router.route('/search/:game').get(protect, gameSearch);


export default router;