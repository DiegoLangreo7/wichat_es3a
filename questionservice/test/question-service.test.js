const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Question = require('../src/model/question');

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    app = require('../src/service/questionService');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    app.close();
});

describe('Question Service', () => {
    it('should get a question by category on GET /getQuestionsDb/:category', async () => {
        const category = 'country';
        const numberOfQuestions = 10;

        const response = await request(app).get(`/getQuestionsDb/${category}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('question');
        expect(response.body).toHaveProperty('options');
        expect(response.body).toHaveProperty('correctAnswer');
        expect(response.body).toHaveProperty('category');
        expect(response.body).toHaveProperty('imageUrl');
    }, 180000); //3 minutos
});