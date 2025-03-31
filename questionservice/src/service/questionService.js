const express = require('express');

const dataService = require('./questionSaverService');
const generateService = require('./questionGeneratorService');
const app = express();
const port = 8004;

// Middleware to parse JSON in request body
app.use(express.json());

app.get('/getQuestionsDb/:category', async (req, res) => {
    try{
        console.log("Question service: " + req.params.category);
        const questionsToGenerate = 20;
        const category = req.params.category;
        const numberQuestions = await dataService.getNumberQuestionsByCategory(category);
        console.log("Numero de preguntas " + numberQuestions + " category " + category);
        if(numberQuestions < 10){
            console.log("Generando preguntas");
            await generateService.generateQuestionsByCategory(category,questionsToGenerate);
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

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
});

module.exports = server