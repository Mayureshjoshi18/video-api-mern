import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const initDB = async () => {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        filename TEXT,
        size INTEGER,
        duration INTEGER,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    return db;
};