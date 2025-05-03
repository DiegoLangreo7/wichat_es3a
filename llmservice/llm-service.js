const axios = require('axios');
const express = require('express');
require('dotenv').config({ path: '../.env' });
const apiKey = process.env.LLM_API_KEY
const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());

// Define configuration for Gemini API
const geminiConfig = {
    url: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (question) => ({
        contents: [{ parts: [{ text: question }] }]
    }),
    transformResponse: (response) => response.data.candidates[0]?.content?.parts[0]?.text
};

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
        if (!(field in req.body)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
}

// Function to send questions to Gemini
async function sendQuestionToGemini(question, apiKey) {
    try {
        console.log(`Sending question to Gemini: "${question.substring(0, 50)}..."`);

        const url = geminiConfig.url(apiKey);
        const requestData = geminiConfig.transformRequest(question);
        const headers = { 'Content-Type': 'application/json' };

        const response = await axios.post(url, requestData, { headers });
        const answer = geminiConfig.transformResponse(response);

        console.log(`Received answer: "${answer?.substring(0, 50)}..."`);
        return answer;

    } catch (error) {
        console.error(`Error sending question to Gemini:`, error.message || error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        return null;
    }
}

function buildPrompt(question, solution, options, userMessage) {
    return `
    Contexto:
    - Pregunta original: "${question}"
    - Respuesta correcta: "${solution}"
    - Mensaje del usuario: "${userMessage}"
    - Opciones disponibles: ${options.join(', ')}

    Instrucciones:
    1. Objetivo:
       - Proporcionar una pista útil que acerque al usuario a la respuesta correcta ("${solution}").
    2. Restricciones:
       - No puedes revelar la respuesta completa ni mencionar directamente "${solution}".
       - Si el usuario pregunta por una opción específica (${options.join(', ')}), evita confirmar o negar si es correcta.
    3. Requisitos:
       - La pista debe ser breve (1-2 oraciones), útil y natural.
       - Usa un tono conversacional y amigable.
    `;
}

// Game hint endpoint - needed for the LLMChat component
app.post('/game-hint', async (req, res) => {

  try {
    console.log("Request body for game-hint:", req.body);
    
    validateRequiredFields(req, ['question', 'solution']);
    
    const { question, solution, options, userMessage = '¿Me puedes dar una pista?' } = req.body;
    
    console.log("API Key length:", apiKey ? apiKey.length : 'undefined');
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is missing. Check your .env file.' });
    }
    
    const prompt = buildPrompt(question, solution, options, userMessage);
    const answer = await sendQuestionToGemini(prompt, apiKey);

        if (answer === null) {
            return res.status(500).json({ error: 'Failed to get hint from LLM service' });
        }

        res.json({ answer });

    } catch (error) {
        console.error('Error in /game-hint endpoint:', error);
        res.status(400).json({ error: error.message });
    }
});

const server = app.listen(port, () => {
    console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server;