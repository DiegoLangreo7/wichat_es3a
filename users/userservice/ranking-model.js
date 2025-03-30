const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    timePlayed: {
        type: Number,
        default: 0,
    },
    gamesPlayed: {
        type: Number,
        default: 0,
    },
    correctAnswered: {
        type: Number,
        default: 0,
    },
    incorrectAnswered: {
        type: Number,
        default: 0,
    },
    puntuation: {
        type: Number,
        default: 0,
    },
});

const Ranking = mongoose.model('Ranking', rankingSchema);

module.exports = Ranking;