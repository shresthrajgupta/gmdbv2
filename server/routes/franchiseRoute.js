import express from 'express';

import { protect, admin } from '../middlewares/authMiddleware.js';

import { getFranchiseDetail } from "../controllers/franchiseController.js";

const router = express.Router();

router.route('/:guid').get(protect, getFranchiseDetail);


export default router;