import express from 'express';
import { mergeVideosHandler, trimVideoHandler } from './controllers/VideoController';

export const router = express.Router();


router.post('/trim', trimVideoHandler);

router.post('/merge', mergeVideosHandler);