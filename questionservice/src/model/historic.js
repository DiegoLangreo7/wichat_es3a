const mongoose = require('mongoose');

const historicSchema = new mongoose.Schema({
    timesPlayed: Number,
    correctAnswers: Number,
    incorrectAnswers: Number,
    timePlayed: Number,
    user: String,
    gameMode: String
});

const Historic = mongoose.model('Historic', historicSchema);

module.exports = Historic
