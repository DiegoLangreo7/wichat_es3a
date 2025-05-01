const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const QuestionUser = require('../historicservice/questionUser');

let app;
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    app = require('./historicService');
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await QuestionUser.deleteMany(); // Limpia la colección después de cada test
});

describe('Historic Service Tests', () => {
    it('should add a question to the historic successfully', async () => {
        const questionData = {
            user: 'testUser',
            type: 'multiple-choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            category: 'science',
            answer: 'A',
            time: 30,
            imageUrl: 'http://example.com/image.png',
        };

        const response = await request(app)
            .post('/historic/addQuestion')
            .send(questionData);

        expect(response.status).toBe(200);
        expect(response.body.user).toBe('testUser');
        expect(response.body.type).toBe('multiple-choice');
    });

    it('should return the historic data for a valid username', async () => {
        const questionData = {
            user: 'testUser',
            type: 'multiple-choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            category: 'science',
            answer: 'A',
            time: 30,
            imageUrl: 'http://example.com/image.png',
        };

        // Agregar una pregunta al historial
        await new QuestionUser(questionData).save();

        const response = await request(app).get('/historic/testUser');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].user).toBe('testUser');
    });

    it('should return 400 if adding a question fails', async () => {
        const invalidData = {}; // Datos inválidos

        const response = await request(app)
            .post('/historic/addQuestion')
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    it('should return 400 if fetching historic data fails', async () => {
        jest.spyOn(QuestionUser, 'find').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app).get('/historic/testUser');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Database error');
    });
});