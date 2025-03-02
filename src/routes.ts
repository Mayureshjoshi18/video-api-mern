import express from 'express';
import { trimVideoHandler } from './controllers/VideoController';

export const router = express.Router();

/**
 * @swagger
 * /trim:
 *   post:
 *     summary: Trim a video
 *     description: Trims a video from start time to end time.
 *     tags:
 *       - Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *                 example: "1234"
 *               start:
 *                 type: number
 *                 example: 10
 *               end:
 *                 type: number
 *                 example: 30
 *     responses:
 *       200:
 *         description: Successfully trimmed video
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/trim', trimVideoHandler);