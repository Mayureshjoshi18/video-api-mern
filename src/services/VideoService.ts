import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { initDB } from '../database';
import { v4 as uuidv4 } from 'uuid';
import fss from 'fs/promises';
import fs from 'fs';
import multer from 'multer';
import { Constants as constants } from '../constants';


const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}


export const trimVideo = async (videoId: string, start: number, end: number) => {

    const db = await initDB();
    const video = await db.get('SELECT * FROM videos WHERE id = ?', [videoId]);
    if (!video) throw new Error('Video not found');

    const videoPath = path.join(__dirname, '../../uploads', video.filename);
    console.log(videoPath);

    try {
        await fss.access(videoPath);
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

    console.log(outputPath);

    return new Promise((resolve, reject) => {
        const mergeCommand = ffmpeg();
        
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


export const validateFileSize = (size: number) => {
    return (size / (1024 * 1024)) <= constants.MAX_SIZE_MB;
};


export const validateVideoDuration = async (filePath: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const ffmpeg = require('fluent-ffmpeg');

        ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
            if (err) {
                reject(err);
                return;
            }
            const duration = metadata.format.duration;
            if (duration < constants.MIN_DURATION_SEC || duration > constants.MAX_DURATION_SEC) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

export const saveVideoMetadata = async (id: string, filename: string, size: number) => {
    const db = await initDB();
    await db.run('INSERT INTO videos (id, filename, size) VALUES (?, ?, ?)', id, filename, size);
};

export const getVideoMetadata = async (id: string) => {
    const db = await initDB();
    return db.get('SELECT * FROM videos WHERE id = ?', [id]);
};


let uploadFileName: string;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        uploadFileName = `${Date.now()}-${file.originalname}`;  // Update fileName correctly
        cb(null, uploadFileName);
    }
});


export const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }).single('video');


export const uploadVideo = async (file: Express.Multer.File) => {
    if (!file) {
        throw new Error("No file uploaded");
    }

    const { originalname, mimetype, size } = file;

    console.log(file);

    if (!constants.ALLOWED_VIDEO_TYPES.includes(mimetype)) {
        throw new Error("Invalid file type. Only video files are allowed.");
    }

    const db = await initDB();
    const videoId = uuidv4();

    await db.run("INSERT INTO videos (id, filename, size) VALUES (?, ?, ?)", [
        videoId,
        uploadFileName,
        size,
    ]);

    console.log(uploadFileName);

    return { id: videoId, filename: uploadFileName };
};