import express from 'express';
import { trimVideoHandler } from './controllers/VideoController';

export const router = express.Router();


router.post('/trim', trimVideoHandler);
