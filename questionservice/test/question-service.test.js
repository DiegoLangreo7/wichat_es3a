const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    app = require('../src/service/questionService');
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('Question Service', () => {
    it('should initialize questions for categories on POST /initializeQuestionsDB', async () => {

        const response = await request(app)
            .post('/initializeQuestionsDB')
            .send({ categories: ['country'] });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Questions initialized successfully');
    });

    it('should get a question by category on GET /questions/:category', async () => {
        const response = await request(app).get('/questions/country');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('question', '¿A qué país pertenece esta imagen?');
        expect(response.body).toHaveProperty('options');
        expect(response.body).toHaveProperty('correctAnswer');
        expect(response.body).toHaveProperty('category', 'country');
        expect(response.body).toHaveProperty('imageUrl');
    });

    it('should return 500 if no questions are available on GET /questions/:category', async () => {
        const response = await request(app).get('/questions/unknownCategory');
        expect(response.status).toBe(500);
        expect(response.body.error).toBeDefined();
    });

    it('should return all questions on GET /getDBQuestions', async () => {
        const response = await request(app).get('/getDBQuestions');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return service health on GET /health', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('service', 'question-service');
        expect(response.body).toHaveProperty('timestamp');
    });
});