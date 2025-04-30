const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');

afterAll(async () => {
    app.close();
});

jest.mock('axios');

// Helper functions
const mockAxios = (method, url, response, isError = false) => {
    axios[method].mockImplementationOnce((reqUrl) => {
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

const testEndpoint = async (method, endpoint, payload, expectedStatus, expectedResponse) => {
    const response = await request(app)[method](endpoint).send(payload);
    expect(response.statusCode).toBe(expectedStatus);
    expect(response.body).toEqual(expectedResponse);
};

describe('Gateway Service', () => {
    it('should forward login request to auth service', async () => {
        mockAxios('post', '/login', { data: { token: 'mockedToken' } });
        await testEndpoint('post', '/login', { username: 'testuser', password: 'testpassword' }, 200, { token: 'mockedToken' });
    });

    it('should resend the error 500 on login from the auth service', async () => {
        mockAxios('post', '/login', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('post', '/login', { username: 'testuser', password: 'testpassword' }, 500, { error: 'Internal Server Error' });
    });

    it('should forward stats/:username request to user service', async () => {
        mockAxios('get', '/stats/testUser', { data: { stats: { punctuation: '100' } } });
        await testEndpoint('get', '/stats/testUser', null, 200, { stats: { punctuation: '100' } });
    });

    it('should resend the error 500 on stats/:username from the user service', async () => {
        mockAxios('get', '/stats/testUser', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('get', '/stats/testUser', null, 500, { error: 'Internal Server Error' });
    });

    it('should forward stats request to user service', async () => {
        mockAxios('post', '/stats', { data: { success: 'OK' } });
        await testEndpoint('post', '/stats', { punctuation: '200' }, 200, { success: 'OK' });
    });

    it('should resend the error 500 on stats from the user service', async () => {
        mockAxios('post', '/stats', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('post', '/stats', { punctuation: '200' }, 500, { error: 'Internal Server Error' });
    });

    it('should forward getStats request to user service', async () => {
        mockAxios('get', '/getStats', { data: { stats: { punctuation: '100' } } });
        await testEndpoint('get', '/getStats', null, 200, { stats: { punctuation: '100' } });
    });

    it('should resend the error 500 on getStats from the user service', async () => {
        mockAxios('get', '/getStats', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('get', '/getStats', null, 500, { error: 'Internal Server Error' });
    });

    it('should return questions for a valid category', async () => {
        mockAxios('get', '/questions/science', { data: { question: 'What is the speed of light?' } });
        await testEndpoint('get', '/questions/science', null, 200, { question: 'What is the speed of light?' });
    });

    it('should return 500 if the question service fails', async () => {
        mockAxios('get', '/questions/science', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('get', '/questions/science', null, 500, { error: 'Internal Server Error' });
    });

    it('should return 404 if the category is not found', async () => {
        mockAxios('get', '/questions/unknown', { status: 404, data: { error: 'Category not found' } }, true);
        await testEndpoint('get', '/questions/unknown', null, 404, { error: 'Category not found' });
    });

    it('should return 400 if the category is invalid', async () => {
        mockAxios('get', '/questions/invalid', { status: 400, data: { error: 'Invalid category' } }, true);
        await testEndpoint('get', '/questions/invalid', null, 400, { error: 'Invalid category' });
    });

    it('should forward add user request to user service', async () => {
        mockAxios('post', '/adduser', { data: { userId: 'mockedUserId' } });
        await testEndpoint('post', '/adduser', { username: 'newuser', password: 'newpassword' }, 200, { userId: 'mockedUserId' });
    });

    it('should resend the error 500 on adduser from the user service', async () => {
        mockAxios('post', '/adduser', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('post', '/adduser', { username: 'testuser', password: 'testpassword' }, 500, { error: 'Internal Server Error' });
    });

    it('should initialize the questions database successfully', async () => {
        mockAxios('post', '/initializeQuestionsDB', { data: { message: 'Preguntas inicializadas correctamente' } });
        await testEndpoint('post', '/initializeQuestionsDB', { someData: 'example' }, 200, { message: 'Preguntas inicializadas correctamente' });
    });

    it('should forward game-hint request to the llm service', async () => {
        mockAxios('post', '/game-hint', { data: { answer: 'llmanswer' } });
        await testEndpoint('post', '/game-hint', { question: 'question', apiKey: 'apiKey', model: 'gemini' }, 200, { answer: 'llmanswer' });
    });

    it('should resend the error 500 on game-hint from the llm service', async () => {
        mockAxios('post', '/game-hint', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('post', '/game-hint', { question: 'question', apiKey: 'apiKey', model: 'gemini' }, 500, { error: 'Internal Server Error' });
    });

    it('should return card values successfully', async () => {
        mockAxios('get', '/cardValues', { data: { values: ['Ace', 'King', 'Queen'] } });
        await testEndpoint('get', '/cardValues', null, 200, { values: ['Ace', 'King', 'Queen'] });
    });

    it('should return 500 if the card service fails', async () => {
        mockAxios('get', '/cardValues', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('get', '/cardValues', null, 500, { error: 'Internal Server Error' });
    });

    it('should add a question to the historic successfully', async () => {
        mockAxios('post', '/historic/addQuestion', { data: { message: 'Pregunta añadida al historial correctamente' } });
        await testEndpoint('post', '/historic/addQuestion', {
            user: 'testUser',
            type: 'multiple-choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            category: 'science',
            answer: 'A',
            time: 30,
            imageUrl: 'http://example.com/image.png',
        }, 200, { message: 'Pregunta añadida al historial correctamente' });
    });

    it('should return 500 if the historic service fails', async () => {
        mockAxios('post', '/historic/addQuestion', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('post', '/historic/addQuestion', {
            user: 'testUser',
            type: 'multiple-choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            category: 'science',
            answer: 'A',
            time: 30,
            imageUrl: 'http://example.com/image.png',
        }, 500, { error: 'Internal Server Error' });
    });

    it('should return the historic data for a valid username', async () => {
        mockAxios('get', '/historic/testUser', { data: { history: ['Question1', 'Question2'] } });
        await testEndpoint('get', '/historic/testUser', null, 200, { history: ['Question1', 'Question2'] });
    });

    it('should return 500 if the historic service fails', async () => {
        mockAxios('get', '/historic/testUser', { status: 500, data: { error: 'Internal Server Error' } }, true);
        await testEndpoint('get', '/historic/testUser', null, 500, { error: 'Internal Server Error' });
    });

    it('should return 404 if the username is not found', async () => {
        mockAxios('get', '/historic/unknownUser', { status: 404, data: { error: 'User not found' } }, true);
        await testEndpoint('get', '/historic/unknownUser', null, 404, { error: 'User not found' });
    });
});