const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');

const app = express();
const port = 8006;

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';

app.use(cors());
app.use(express.json());

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Endpoint: Obtener la lista de usuarios
app.get('/api/users', async (req, res) => {
  try {
      const statsResponse = await axios.get(`${userServiceUrl}/getDBUsers`);
      res.json(statsResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Endpoint: Obtener preguntas
app.get('/api/questions', async (req, res) => {
    try {
        const response = await axios.get(`${questionServiceUrl}/getDBQuestions`);
        res.json(response.data);
    } catch (error) {
        res.status(error?.response?.status || 500).json({
            error: error?.response?.data?.error || error.message || 'Error interno'
        });
    }
});

const server = app.listen(port, () => {
  console.log(`Gateway API Service listening at http://localhost:${port}`);
});

module.exports = server;