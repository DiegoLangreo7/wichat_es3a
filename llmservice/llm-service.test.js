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
    } else if (url.endsWith('https://empathyai')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  // Test /ask endpoint
  it('the llm should reply', async () => {
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

});