import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { initDB } from '../database';
import { v4 as uuidv4 } from 'uuid';
import fss from 'fs/promises';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

export const trimVideo = async (videoId: string, start: number, end: number) => {

    const db = await initDB();
    const video = await db.get('SELECT * FROM videos WHERE id = ?', [videoId]);
    if (!video) throw new Error('Video not found');

    const videoPath = path.join(__dirname, '../../uploads', video.filename);

    try {
        await fss.access(videoPath); // Check if the file exists
    } catch (error) {
        console.log(videoPath);
        throw new Error('VideoPath not found');
    }
    
    const outputFilename = `trimmed_${uuidv4()}.mp4`;
    const outputPath = path.join(UPLOAD_DIR, outputFilename);

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .setStartTime(start)
            .setDuration(end - start)
            .output(outputPath)
            .on('end', async () => {
                const newId = uuidv4();
                await db.run('INSERT INTO videos (id, filename, size) VALUES (?, ?, ?)', newId, outputFilename, (await fss.stat(outputPath)).size);
                resolve({ id: newId, filename: outputFilename });
            })
            .on('error', (err) => reject(err))
            .run();
    });
};