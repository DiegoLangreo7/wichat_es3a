const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8000;

const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';

app.use(cors());
app.use(express.json());

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Endpoint: Obtener estadísticas de un usuario
app.get('/stats/:username', async (req, res) => {
  try {
      const username = req.params.username;
      const statsResponse = await axios.get(`${userServiceUrl}/stats/${username}`);
      res.json(statsResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Endpoint: Actualizar estadísticas de un usuario
app.post('/stats', async (req, res) => {
  try {
      const statsResponse = await axios.post(`${userServiceUrl}/stats`, req.body);
      res.json(statsResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Endpoint: Obtener ranking completo
app.get('/getStats', async (req, res) => {
  try {
      const response = await axios.get(`${userServiceUrl}/getStats`);
      res.json(response.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

app.get('/questions/:category', async (req, res) => {
    try{
        console.log("Category: " + req.params.category);
        const category = req.params.category;
        const questionResponse = await axios.get(questionServiceUrl+`/getQuestionsDb/${category}`);
        res.json(questionResponse.data);
    }catch (error) {
        res.status(error.response.status).json({ error: error.response.data.error });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});


app.post('/login', async (req, res) => {
  try {
      const authResponse = await axios.post(`${authServiceUrl}/login`, req.body);
      res.json(authResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});
 


app.post('/adduser', async (req, res) => {
  try {
      const userResponse = await axios.post(`${userServiceUrl}/adduser`, req.body);
      res.json(userResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});


app.post('/askllm', async (req, res) => {
    try {
        // Forward the add user request to the user service
        const llmResponse = await axios.post(llmServiceUrl+'/ask', req.body);
        res.json(llmResponse.data);
    } catch (error) {
        res.status(error.response.status).json({ error: error.response.data.error });
    }
});


app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Swagger config
const openapiPath = './openapi.yaml';
if (fs.existsSync(openapiPath)) {
    const file = fs.readFileSync(openapiPath, 'utf8');

    // Parse the YAML content into a JavaScript object representing the Swagger document
    const swaggerDocument = YAML.parse(file);

    // Serve the Swagger UI documentation at the '/api-doc' endpoint
    // This middleware serves the Swagger UI files and sets up the Swagger UI page
    // It takes the parsed Swagger document as input
    app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
    console.log("Not configuring OpenAPI. Configuration file not present.")
}


const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server
