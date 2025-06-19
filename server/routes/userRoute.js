import express from 'express';

import { protect, admin } from '../middlewares/authMiddleware.js';

import { signup, verifyOtp, login, homepageGames, getProfile, addToPlaylist, delFromPlaylist, addToCompletedList, delFromCompletedList, showPlaylist, showCompletedList } from '../controllers/userController.js';

const router = express.Router();

router.route("/").get(protect, getProfile);
router.route('/signup').post(signup);
router.route('/verifyotp').post(verifyOtp);
router.route('/login').post(login);
router.route('/homepagegames').get(protect, homepageGames);
router.route('/playlist').post(protect, addToPlaylist).delete(protect, delFromPlaylist).get(protect, showPlaylist);
router.route('/completedlist').post(protect, addToCompletedList).delete(protect, delFromCompletedList).get(protect, showCompletedList);


export default router;