const express = require('express');

const dataService = require('./questionSaverService');
const generateService = require('./questionGeneratorService');
const app = express();
const port = 8004;

const MIN_QUESTIONS = 10;
const GENERATE_BATCH = 20;

// Middleware to parse JSON in request body
app.use(express.json());

app.get('/getQuestionsDb/:category', async (req, res) => {
    try{
        console.log("Question service: " + req.params.category);
        const category = req.params.category;
        const numberQuestions = await dataService.getNumberQuestionsByCategory(category);
        console.log("Numero de preguntas " + numberQuestions + " category " + category);
        if(numberQuestions < MIN_QUESTIONS){
            console.log("Generando preguntas");
            generateService.generateQuestionsByCategory(category, GENERATE_BATCH)
                .then(() => {
                    console.log("Preguntas generadas correctamente");
                })
                .catch((error) => {
                    console.error("Error al generar preguntas:", error);
                });
        }

        const question = await dataService.getRandomQuestionByCategory(category);
        console.log("Pregunta generada: " + question);
        if (!question) {
            return res.status(404).json({ message: "There are no more questions available." });
        }
        dataService.deleteQuestionById(question._id);

        res.json(question);

    }catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getDBQuestions', async (req, res) => {
    try {
        const questions = await dataService.getAllQuestions();
        res.json(questions);
    } catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
});

module.exports = server