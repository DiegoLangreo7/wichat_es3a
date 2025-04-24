const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('../users/userservice/user-model');
const Question = require('../questionservice/src/model/question');
const QuestionUser = require('./questionUser');

const app = express();
const port = 8007;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

app.post('/historic/addQuestion', async (req, res) => {
    try {

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
