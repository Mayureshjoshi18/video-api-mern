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



export const mergeVideos = async (videoIds: string[]) => {
    const db = await initDB();

    const videos = await Promise.all(videoIds.map(async filename => {
        const video = await db.get('SELECT * FROM videos WHERE filename = ?', [filename]);
        console.log(`DB Lookup for ${filename}:`, video);
        return video;
    }));

    if (videos.some(v => !v)) throw new Error('One or more videos not found');

    const outputFilename = `merged_${uuidv4()}.mp4`;
    const outputPath = path.join(UPLOAD_DIR, outputFilename);

    return new Promise((resolve, reject) => {
        const mergeCommand = ffmpeg();
        
        // Add input files
        videos.forEach(video => mergeCommand.input(path.join(UPLOAD_DIR, video.filename)));

        mergeCommand
            .on('end', async () => {
                const newId = uuidv4();
                await db.run(
                    'INSERT INTO videos (id, filename, size) VALUES (?, ?, ?)',
                    newId, outputFilename, (await fss.stat(outputPath)).size);
                resolve({ id: newId, filename: outputFilename });
            })
            .on('error', (err) => reject(err))
            .mergeToFile(outputPath, UPLOAD_DIR);
    });
};