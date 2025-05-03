const request = require('supertest');
const axios = require('axios');

let app;

jest.mock("axios")

describe('Card Service', () => {
    beforeAll(async () => {
        app = require('./cardService');
    });

    afterAll(async () => {
        app.close();
    });

    it('should return error 500 GET /cardValues', async () => {
        axios.get.mockRejectedValue(new Error('Simulated axios failure'));

        const response = await request(app).get('/cardValues');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error fetching images' });
    });
});