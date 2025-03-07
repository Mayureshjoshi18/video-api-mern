import { NextFunction, Request, Response } from 'express';
import { mergeVideos, trimVideo, uploadVideo, upload} from '../services/VideoService';



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
        next(error);
    }
};

export const mergeVideosHandler = async (req: Request, res: Response) => {
    const { videoIds } = req.body;
    try {
        if(videoIds || Array.isArray(videoIds) || videoIds.length > 2) {
            const result = await mergeVideos(videoIds);
            res.json(result);
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const uploadVideoHandler = (req: Request, res: Response) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const videoData = await uploadVideo(req.file!);
            res.status(201).json(videoData);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
};    