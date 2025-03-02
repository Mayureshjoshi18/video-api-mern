import { Request, Response, NextFunction } from 'express';

const SECRET_KEY = "your_static_api_secret";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token || token !== `Bearer ${SECRET_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};
