const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const User = require('./user-model');
const Ranking = require('./ranking-model');

const app = express();
const port = 8001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
        if (!(field in req.body)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
}

function validateFormatOfFields(username, password) {
    const errors = [];

    if (username.length < 3) {
        errors.push(`El nombre de usuario debe tener al menos 3 caracteres`);
    }
    if (password.length < 8) {
        errors.push(`La contraseña debe tener al menos 8 caracteres`);
    } else {
        if (!password.match(/[a-zA-Z]/g)) {
            errors.push(`La contraseña debe contener al menos una letra`);
        }
        if (!password.match(/\d/g)) {
            errors.push(`La contraseña debe contener al menos un número`);
        }
        if (!password.match(/[!@#$%^&*.]/g)) {
            errors.push(`La contraseña debe contener al menos un caracter especial (!@#$%^&*.)`);
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }
}

app.post('/adduser', async (req, res) => {
    try {
        validateRequiredFields(req, ['username', 'password']);

        const user = await User.findOne({ username: req.body.username });
        if (user) throw new Error(`El usuario ${req.body.username} ya existe`);

        validateFormatOfFields(req.body.username, req.body.password);

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });

        await newUser.save();
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para obtener estadísticas
app.get('/stats/:username', async (req, res) => {
    try {
        const username = req.params.username;
        let ranking = await Ranking.findOne({ username });
        if (!ranking) {
            ranking = new Ranking({
                username,
                correctAnswered: 0,
                incorrectAnswered: 0,
                gamesPlayed: 0,
                timePlayed: 0,
                puntuation: 0
            });
            await ranking.save();
        }
        res.json(ranking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para actualizar estadísticas
app.post('/stats', async (req, res) => {
    try {
        const { username, correctAnswered, incorrectAnswered, gamesPlayed, timePlayed, puntuation } = req.body;
        let ranking = await Ranking.findOne({ username });

        if (!ranking) {
            ranking = new Ranking({
                username,
                correctAnswered: 0,
                incorrectAnswered: 0,
                gamesPlayed: 0,
                timePlayed: 0,
                puntuation: 0
            });
        }

        ranking.correctAnswered += correctAnswered;
        ranking.incorrectAnswered += incorrectAnswered;
        ranking.gamesPlayed += gamesPlayed;
        ranking.timePlayed += timePlayed;
        ranking.puntuation += puntuation;

        await ranking.save();
        res.json(ranking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para obtener todos los rankings ordenados por puntuation
app.get('/getStats', async (req, res) => {
    try {
        const rankings = await Ranking.find().sort({ puntuation: -1 });
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el ranking' });
    }
});

app.get('/getDBUsers', async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, _id: 1, createdAt: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});


const server = app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`);
});

server.on('close', () => {
    mongoose.connection.close();
});

module.exports = server;
