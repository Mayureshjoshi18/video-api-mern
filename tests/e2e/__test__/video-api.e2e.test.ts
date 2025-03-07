import request from 'supertest';
import app from '../../../src/app';
import path from 'path';



let server: any;
let responseVideoId: any;
let responseVideoName: any;
let sharedLink: any;

jest.setTimeout(20000);

beforeAll(async () => {
    server = app.listen(3001, () => {
        console.log('Test server running...');
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));
});

const API_TOKEN = process.env.TEST_API_TOKEN || 'static-token';

describe('Video API E2E Tests', () => {

    
    it('should upload a video successfully', async () => {
        const filePath = path.resolve(__dirname, 'test-video.mp4');
        console.log('Uploading file from:', filePath);
        
        const response = await request(app)
            .post('/upload')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .set('Content-Type', 'multipart/form-data')
            .attach('video', filePath, 'test-video.mp4');

        console.log('Upload response:', response.status, response.body);

        responseVideoId = response.body.id;

        responseVideoName = response.body.filename;
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('filename');
        expect(typeof response.body.id).toBe('string');
        expect(typeof response.body.filename).toBe('string');
    });

    it('should trim the uploaded video', async () => {

        const videoId = responseVideoId;
        const start = 10;
        const end = 30;

        const response = await request(app)
            .post('/trim')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .set('Content-Type', 'application/json')
            .send({ videoId, start, end });

        console.log('Trim response:', response.status, response.body);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(typeof response.body.id).toBe('string');

    });

    it('should merge two videos', async () => {
        const videoIds = [
            `${responseVideoName}`,
            '1741372208982-test-video.mp4',
        ];
    
        console.log('Sending request with:', { videoIds }); 
    
        const response = await request(app)
            .post('/merge')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .set('Content-Type', 'application/json')
            .send({ videoIds });
    
        console.log('Merge response:', response.status, response.body);
    
        if (response.status !== 200) {
            console.error('Server error:', response.body);
        }
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(typeof response.body.id).toBe('string');
    }, 600000); 

    it('should share a video', async () => {
        const response = await request(app)
            .post('/share')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .set('Content-Type', 'application/json')
            .send({ videoId: `${responseVideoId}`, expiryTime : 300 });

        console.log("share response: ", response.body);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('link');
        expect(response.body.link).toMatch(/^\/view\/[a-f0-9-]+$/);
        sharedLink = response.body.link.split('/').pop();
        console.log(sharedLink);
    });

    it('should allow viewing a shared video', async () => {
        const response = await request(app)
            .get(`/view/${sharedLink}`)
            .set('Authorization', `Bearer ${API_TOKEN}`);

        console.log('View response:', response.status, response.body);

        expect(response.status).toBe(200);

    });
});

afterAll(async () => {
    await server.close();
});
