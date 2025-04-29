const axios = require('axios');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());
app.use(cors());

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

// Game hint endpoint - needed for the LLMChat component
app.post('/game-hint', async (req, res) => {
    try {
        console.log("Request body for game-hint:", req.body);

        validateRequiredFields(req, ['question', 'solution']);

        const { question, solution, options, userMessage = '¿Me puedes dar una pista?' } = req.body;

        const apiKey = "AIzaSyCuaY0maosmIEIAadFa6IQtVUwlNMbIE7M";
        console.log("API Key length:", apiKey ? apiKey.length : 'undefined');

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is missing. Check your .env file.' });
        }

        const prompt = `
    Contexto:
    - Pregunta original: "${question}"
    - Respuesta correcta: "${solution}"
    - El usuario ha preguntado: "${userMessage}"

    Instrucciones para tu respuesta:
    1. OBJETIVO: Dar una pista que ayude al usuario respondiendo a la pregunta que ha realizado "${userMessage}" para adivinar la respuesta correcta ("${solution}")
    2. RESTRICCIONES:
      - No puedes responder ni SI ni NO ante una pregunta que tenga que ver con las opciones "${options.join(', ')}"
      - NO puedes mencionar la palabra "${solution}" directamente
      - NO puedes revelar la respuesta completa
    3. REQUISITOS:
      - La pista debe ser útil pero no obvia
    4. FORMATO:
      - Breve (1-2 oraciones)
      - Natural (como una conversación)
    `;

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