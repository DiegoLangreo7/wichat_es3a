const mongoose = require('mongoose');

const historicSchema = new mongoose.Schema({
    timesPlayed: Number,
    correctAnswers: Number,
    incorrectAnswers: Number,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    gameMode: String
});

const Historic = mongoose.model('Historic', historicSchema);

module.exports = Historic
