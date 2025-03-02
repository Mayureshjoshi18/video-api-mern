import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { router } from './routes';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(router);


const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Video Processing API',
            version: '1.0.0',
            description: 'API for video upload, trimming, merging, and sharing'
        }
    },
    apis: ['./**/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});