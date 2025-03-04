import express from 'express';
import { mergeVideosHandler, trimVideoHandler, uploadVideoHandler } from './controllers/VideoController';
import { shareVideoHandler, viewSharedVideoHandler } from './controllers/ShareController';

export const router = express.Router();


router.post('/trim', trimVideoHandler);

router.post('/merge', mergeVideosHandler);

router.post('/upload', uploadVideoHandler);

router.post('/share', shareVideoHandler);

router.get('/view/:linkId', viewSharedVideoHandler);