import express from 'express';
import { router } from './routes';
import authenticate from './middlewares/AuthMiddleware';

const app = express();

app.use(express.json());
app.use(authenticate);
app.use(router);


export default app;