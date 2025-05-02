const express = require('express');
const mongoose = require('mongoose');
const QuestionUser = require('./questionUser');

const app = express();
app.disable('x-powered-by');
const port = 8007;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

app.post('/historic/addQuestion', async (req, res) => {
    try {
        if(!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }
        const questionUser = new QuestionUser({
            user: req.body.user,
            type: req.body.type,
            options: req.body.options,
            correctAnswer: req.body.correctAnswer,
            category: req.body.category,
            answer: req.body.answer,
            time: req.body.time,
            imageUrl: req.body.imageUrl,
        })
        console.log(questionUser);
        await questionUser.save();
        res.json(questionUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para obtener estadísticas
app.get('/historic/:username', async (req, res) => {
    try {
        const username = req.params.username;
        let historic = await QuestionUser.find({user: username})
        res.json(historic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


const server = app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`);
});

server.on('close', () => {
    mongoose.connection.close();
});

module.exports = server;
