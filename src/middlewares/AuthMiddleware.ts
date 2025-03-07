import { Request, Response, NextFunction } from 'express';

const API_TOKENS = new Set([
    'static-token'
]);

const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token || !API_TOKENS.has(token)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    next();
};

export default authenticate;
