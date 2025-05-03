const request = require('supertest');

let app;

describe('Card Service', () => {
    beforeAll(async () => {
        app = require('./cardService');
    });

    afterAll(async () => {
        app.close();
    });

    it('should get card values on GET /cardValues', async () => {
        const response = await request(app).get('/cardValues');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('images');
        expect(Array.isArray(response.body.images)).toBe(true);
    });
});