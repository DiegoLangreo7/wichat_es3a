const request = require('supertest');
const axios = require('axios');
const app = require('./llm-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

describe('LLM Service', () => {
  // Mock responses from external services
    axios.post.mockImplementation((url, data) => {
        if (url.startsWith('https://generativelanguage')) {
            return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'llmanswer' }] } }] } });
        } else if (url.startsWith('https://empathyai')) {
            return Promise.resolve({ data: { answer: 'llmanswer' } });
        }
    });

  // Test /ask endpoint
    it('should reply', async () => {
        const response = await request(app)
        .post('/game-hint')
        .send({
            question: "¿A que pais pertenece esta imagen?",
            solution: "España",
            options: ["España", "Etiopia","Ecuador","Rusia"],
            userMessage: "Cual pais no es"
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toBe('llmanswer');
    });

    it('should handle the error 400', async () => {
        const response = await request(app)
            .post('/game-hint')
            .send();

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Missing required field: question');

    });

    it('should handle the error 500', async () => {
        axios.post.mockRejectedValueOnce(new Error('Simulated server error'));

        const response = await request(app)
        .post('/game-hint')
        .send({
            question: "¿A qué país pertenece esta imagen?",
            solution: "España",
            options: ["España", "Etiopía", "Ecuador", "Rusia"],
            userMessage: "¿Cuál país no es?"
        });

        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Failed to get hint from LLM service');

    });

});