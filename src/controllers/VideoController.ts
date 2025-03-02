import { NextFunction, Request, Response } from 'express';
import { mergeVideos, trimVideo} from '../services/VideoService';



export const trimVideoHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { videoId, start, end } = req.body;
        if (start >= end || start < 0) {
            res.status(400).json({ error: 'Invalid start or end time' });
            return;
        }

        const result = await trimVideo(videoId, start, end);
        res.json(result);
    } catch (error: any) {
        next(error); // Pass error to the middleware
    }
};

export const mergeVideosHandler = async (req: Request, res: Response) => {
    try {
        const { videoIds } = req.body;
        const result = await mergeVideos(videoIds);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};