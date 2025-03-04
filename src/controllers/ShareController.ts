import { Request, Response } from 'express';
import { shareVideo } from '../services/ShareService';
import { initDB } from '../database';
import fs from 'fs';
import { Constants as constants } from '../constants';
import path from 'path';


export const shareVideoHandler = async (req: Request, res: Response) => {
    try {
        const { videoId, expiryTime } = req.body;
        const result = await shareVideo(videoId, expiryTime);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const viewSharedVideoHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { linkId } = req.params;

        const db = await initDB();
        const link = await db.get('SELECT * FROM shared_links WHERE id = ?', [linkId]);

        if (!link) {
            res.status(404).json({ error: 'Invalid or expired link' });
            return;
        }

        if (new Date(link.expiresAt) < new Date()) {
            res.status(410).json({ error: 'Link has expired' });
            return;
        }

        const video = await db.get('SELECT * FROM videos WHERE id = ?', [link.videoId]);
        if (!video) {
            res.status(404).json({ error: 'Video not found' });
            return;
        }
        const UPLOAD_DIR = path.join(__dirname, '../../uploads');
        const filePath = path.join(UPLOAD_DIR, video.filename);
        console.log(filePath);
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving video:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


