const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const axios = require('axios');

jest.mock('axios');

jest.mock('../src/service/questionSaverService', () => ({
    getNumberQuestionsByCategory: jest.fn().mockResolvedValue(10),
    saveQuestionBatch: jest.fn(),
    deleteQuestionById: jest.fn(),
    getAllQuestions: jest.fn().mockResolvedValue([]),
    getRandomQuestionByCategory: jest.fn().mockImplementation((category) => {
        if (category === 'unknownCategory') {
            return null;
        }
        return {
            question: '¿Cuál es la capital de Francia?',
            options: ['París', 'Londres', 'Madrid', 'Berlín'],
            correctAnswer: 'París',
            category: 'geography',
            imageUrl: 'https://example.com/image.jpg',
        };
    }),
}));

jest.mock('../src/service/questionGeneratorService', () => ({
    generateQuestionsByCategory: jest.fn(),
}));

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    app = require('../src/service/questionService');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    await mongoose.connection.dropDatabase();
    jest.clearAllMocks();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    app.close();
});

describe('Question Service', () => {
    it('should initialize questions for categories on POST /initializeQuestionsDB', async () => {

        const response = await request(app)
            .post('/initializeQuestionsDB')
            .send({ categories: ['flags'] });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Questions initialized successfully');
    });

    it('should get a question by category on GET /questions/:category', async () => {
        const response = await request(app).get('/questions/geography');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('question', '¿Cuál es la capital de Francia?');
        expect(response.body).toHaveProperty('options');
        expect(response.body.options).toContain('París');
        expect(response.body.options).toEqual(expect.arrayContaining(['Londres', 'Madrid', 'Berlín']));
        expect(response.body).toHaveProperty('correctAnswer', 'París');
        expect(response.body).toHaveProperty('category', 'geography');
        expect(response.body).toHaveProperty('imageUrl');
    });

    it('should return 404 if no questions are available on GET /questions/:category', async () => {
        const response = await request(app).get('/questions/unknownCategory');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('There are no more questions available.');
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

    it('should handle errors and return 500 on GET /questions/:category', async () => {
        const questionSaverService = require('../src/service/questionSaverService');

        // Forzamos el error al inicio del endpoint
        questionSaverService.getNumberQuestionsByCategory.mockRejectedValueOnce(new Error('Simulated server error'));

        const response = await request(app).get('/questions/flags');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Simulated server error');

    });
});