const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');

afterAll(async () => {
    app.close();
});

jest.mock('axios');

// Helper function to mock axios responses
const mockAxiosPost = (url, response, isError = false) => {
    axios.post.mockImplementationOnce((reqUrl) => {
        if (reqUrl.endsWith(url)) {
            if (isError) {
                return Promise.reject({
                    response: {
                        status: response.status,
                        data: response.data,
                    },
                });
            }
            return Promise.resolve({ data: response.data });
        }
    });
};

const mockAxiosGet = (url, response, isError = false) => {
    axios.get.mockImplementationOnce((reqUrl) => {
        if (reqUrl.endsWith(url)) {
            if (isError) {
                return Promise.reject({
                    response: {
                        status: response.status,
                        data: response.data,
                    },
                });
            }
            return Promise.resolve({ data: response.data });
        }
    });
};

describe('Gateway Service', () => {
    it('should forward login request to auth service', async () => {
        mockAxiosPost('/login', { data: { token: 'mockedToken' } });

        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBe('mockedToken');
    });

    it('should resend the error 500 on login from the auth service', async () => {
        mockAxiosPost('/login', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should forward stats/:username request to user service', async () => {
        mockAxiosGet('/stats/testUser', { data: { stats: { punctuation: '100'} } });

        const response = await request(app)
            .get('/stats/testUser');

        expect(response.statusCode).toBe(200);
        expect(response.body.stats.punctuation).toBe('100');
    });

    it('should resend the error 500 on stats/:username from the user service', async () => {
        mockAxiosGet('/stats/testUser', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .get('/stats/testUser');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should forward stats request to user service', async () => {
        mockAxiosPost('/stats', { data: { success: 'OK' } });

        const response = await request(app)
            .post('/stats')
            .send({ punctuation: '200' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe('OK');
    });

    it('should resend the error 500 on stats from the user service', async () => {
        mockAxiosPost('/stats', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .post('/stats')
            .send({ punctuation: '200' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should forward getStats request to user service', async () => {
        mockAxiosGet('/getStats', { data: { stats: { punctuation: '100'} } });

        const response = await request(app)
            .get('/getStats');

        expect(response.statusCode).toBe(200);
        expect(response.body.stats.punctuation).toBe('100');
    });

    it('should resend the error 500 on getStats from the user service', async () => {
        mockAxiosGet('/getStats', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .get('/getStats');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should return questions for a valid category', async () => {
        mockAxiosGet('/questions/science', { data: { question: 'What is the speed of light?' } });

        const response = await request(app)
            .get('/questions/science');

        expect(response.statusCode).toBe(200);
        expect(response.body.question).toBe('What is the speed of light?');
    });

    it('should return 500 if the question service fails', async () => {
        mockAxiosGet('/questions/science', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .get('/questions/science');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should return 404 if the category is not found', async () => {
        mockAxiosGet('/questions/unknown', { status: 404, data: { error: 'Category not found' } }, true);

        const response = await request(app)
            .get('/questions/unknown');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Category not found');
    });

    it('should return 400 if the category is invalid', async () => {
        mockAxiosGet('/questions/invalid', { status: 400, data: { error: 'Invalid category' } }, true);

        const response = await request(app)
            .get('/questions/invalid');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid category');
    });

    it('should forward add user request to user service', async () => {
        mockAxiosPost('/adduser', { data: { userId: 'mockedUserId' } });

        const response = await request(app)
            .post('/adduser')
            .send({ username: 'newuser', password: 'newpassword' });

        expect(response.statusCode).toBe(200);
        expect(response.body.userId).toBe('mockedUserId');
    });

    it('should resend the error 500 on adduser from the user service', async () => {
        mockAxiosPost('/adduser', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .post('/adduser')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should initialize the questions database successfully', async () => {
        mockAxiosPost('/initializeQuestionsDB', { data: { message: 'Preguntas inicializadas correctamente' } });

        const response = await request(app)
            .post('/initializeQuestionsDB')
            .send({ someData: 'example' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Preguntas inicializadas correctamente');
    });

    it('should forward game-hint request to the llm service', async () => {
        mockAxiosPost('/game-hint', { data: { answer: 'llmanswer' } });

        const response = await request(app)
            .post('/game-hint')
            .send({ question: 'question', apiKey: 'apiKey', model: 'gemini' });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toBe('llmanswer');
    });

    it('should resend the error 500 on game-hint from the llm service', async () => {
        mockAxiosPost('/game-hint', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .post('/game-hint')
            .send({ question: 'question', apiKey: 'apiKey', model: 'gemini' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should return card values successfully', async () => {
        mockAxiosGet('/cardValues', { data: { values: ['Ace', 'King', 'Queen'] } });

        const response = await request(app)
            .get('/cardValues');

        expect(response.statusCode).toBe(200);
        expect(response.body.values).toEqual(['Ace', 'King', 'Queen']);
    });

    it('should return 500 if the card service fails', async () => {
        mockAxiosGet('/cardValues', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .get('/cardValues');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should add a question to the historic successfully', async () => {
        mockAxiosPost('/historic/addQuestion', { data: { message: 'Pregunta añadida al historial correctamente' } });

        const response = await request(app)
            .post('/historic/addQuestion')
            .send({
                user: 'testUser',
                type: 'multiple-choice',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'A',
                category: 'science',
                answer: 'A',
                time: 30,
                imageUrl: 'http://example.com/image.png'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Pregunta añadida al historial correctamente');
    });

    it('should return 500 if the historic service fails', async () => {
        mockAxiosPost('/historic/addQuestion', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .post('/historic/addQuestion')
            .send({
                user: 'testUser',
                type: 'multiple-choice',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'A',
                category: 'science',
                answer: 'A',
                time: 30,
                imageUrl: 'http://example.com/image.png'
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should return the historic data for a valid username', async () => {
        mockAxiosGet('/historic/testUser', { data: { history: ['Question1', 'Question2'] } });

        const response = await request(app)
            .get('/historic/testUser');

        expect(response.statusCode).toBe(200);
        expect(response.body.history).toEqual(['Question1', 'Question2']);
    });

    it('should return 500 if the historic service fails', async () => {
        mockAxiosGet('/historic/testUser', { status: 500, data: { error: 'Internal Server Error' } }, true);

        const response = await request(app)
            .get('/historic/testUser');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should return 404 if the username is not found', async () => {
        mockAxiosGet('/historic/unknownUser', { status: 404, data: { error: 'User not found' } }, true);

        const response = await request(app)
            .get('/historic/unknownUser');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });
});