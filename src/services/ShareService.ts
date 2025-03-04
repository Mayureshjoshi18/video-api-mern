import { v4 as uuidv4 } from 'uuid';
import { initDB } from '../database';


export const shareVideo = async (videoId: string, expiryTime: number) => {
    if (!videoId || expiryTime <= 0) {
        throw new Error('Invalid videoId or expiryTime');
    }

    const db = await initDB();
    const video = await db.get('SELECT * FROM videos WHERE id = ?', [videoId]);

    if (!video) {
        throw new Error('Video not found');
    }

    const linkId = uuidv4();
    const expiresAt = new Date(Date.now() + expiryTime * 1000).toISOString();

    await db.run('INSERT INTO shared_links (id, videoId, expiresAt) VALUES (?, ?, ?)', linkId, videoId, expiresAt);

    return { link: `/view/${linkId}` };
};

// Cleanup function to remove expired links
const cleanupExpiredLinks = async () => {
    const db = await initDB();
    const now = new Date().toISOString();

    await db.run('DELETE FROM shared_links WHERE expiresAt < ?', now);
    console.log('Expired shared links cleaned up');
};

// Run cleanup every 10 minutes
setInterval(cleanupExpiredLinks, 10 * 60 * 1000);
