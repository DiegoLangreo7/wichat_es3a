const mongoose = require('mongoose');

const questionUsersSchema = new mongoose.Schema({
    type: String,
    options: [String],
    correctAnswer: String,
    answer: String,
    category: String,
    imageUrl: String,
    user: String,
    time: Number
});


const QuestionUser = mongoose.model('QuestionUser', questionUsersSchema);

module.exports = QuestionUser