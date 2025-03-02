import express from 'express';
import { mergeVideosHandler, trimVideoHandler, uploadVideoHandler } from './controllers/VideoController';


export const router = express.Router();


router.post('/trim', trimVideoHandler);

router.post('/merge', mergeVideosHandler);

router.post('/upload', uploadVideoHandler);