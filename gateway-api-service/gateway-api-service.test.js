const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-api-service');

afterAll(async () => {
    app.close();
});

jest.mock('axios');

describe('Gateway Service', () => {
    // Mock responses from external services
    axios.get.mockImplementation((url) => {
        if (url.endsWith('/getDBUsers')) {
            return Promise.resolve({
                data: [
                    { id: 1, username: 'user1' },
                    { id: 2, username: 'user2' },
                ],
            });
        } else if (url.endsWith('/getDBQuestions')) {
            return Promise.resolve({
                data: [
                    { id: 1, question: 'What is 2+2?' },
                    { id: 2, question: 'What is the capital of France?' },
                ],
            });
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test /api/users endpoint
    it('should get users from api call', async () => {
        const response = await request(app).get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { id: 1, username: 'user1' },
            { id: 2, username: 'user2' },
        ]);
    });

    // Test /api/questions endpoint
    it('should get questions from api call', async () => {
        const response = await request(app).get('/api/questions');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { id: 1, question: 'What is 2+2?' },
            { id: 2, question: 'What is the capital of France?' },
        ]);

    });

    // Test /api/users endpoint server error
    it('should return an error message for /api/users on server error', async () => {
        axios.get.mockRejectedValueOnce({
            response: {
                status: 500,
                data: { error: 'Error Interno' },
            },
        });

        const response = await request(app).get('/api/users');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: 'Error Interno',
        });
    });

    // Test /api/questions endpoint server error
    it('should return an error message for /api/questions on server error', async () => {
        axios.get.mockRejectedValueOnce({
            response: {
                status: 500,
                data: { error: 'Error Interno' },
            },
        });

        const response = await request(app).get('/api/questions');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: 'Error Interno',
        });
    });

});