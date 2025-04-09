const mongoose = require('mongoose');

const questionUsersSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    answer: String,
    category: String,
    imageUrl: {type: String},
    user: String,
    time: Number
});


const QuestionUser = mongoose.model('QuestionUser', questionUsersSchema);

module.exports = QuestionUser