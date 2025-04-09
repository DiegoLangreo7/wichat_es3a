const mongoose = require('mongoose');
const Question = require('../model/question')


// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
mongoose.connect(mongoUri);


module.exports = {
    
    getNumberQuestionsByCategory: async function(category){
        try{
            const numberQuestions = await Question.countDocuments({category: category});
            return numberQuestions;
        } catch (error) {
            console.error('Error al obtener número de preguntas:', error.message);
            throw new Error(`Error al obtener número de preguntas: ${error.message}`);
        }
    },
    
    saveQuestion: async function(question){
        try{
            const newQuestion = new Question(question);
            await newQuestion.save();
            return newQuestion;
        } catch (error) {
            console.error('Error al guardar pregunta:', error.message);
            throw new Error(`Error al guardar pregunta: ${error.message}`);
        }
    },

    /**
     * Deletes a question from the database.
     * @param {id} str - The id of the document to be removed
     */
    deleteQuestionById : async function(id) {
        try {
        await Question.findByIdAndDelete(id);
        console.log(`Question ${id} deleted successfully`);

        } catch (error) {
            console.error('Error deleting question:', error.message);
            return error.message;
        }
    },

    getRandomQuestionByCategory: async function(categoryParam) {
        try {
            const question = await Question.aggregate([
                { $match: { category: categoryParam } },
                { $sample: { size: 1 } } // Select a random document
            ]);
    
            return question.length > 0 ? question[0] : null; 
        } catch (error) {
            console.error("Error fetching random question:", error);
            throw new Error(error.message);
        }
    },

    getTotalQuestions: async function() {
        try {
            const count = await Question.countDocuments({});
            return count;
        } catch (error) {
            console.error('Error obteniendo número total de preguntas:', error.message);
            throw new Error(`Error al obtener número total de preguntas: ${error.message}`);
        }
    },
    
    getQuestionsByCategory: async function(category) {
        try {
            const questions = await Question.find({ category }, { __v: 0 });
            return questions;
        } catch (error) {
            console.error(`Error obteniendo preguntas para categoría ${category}:`, error.message);
            throw new Error(`Error al obtener preguntas: ${error.message}`);
        }
    },
    
    /**
     * Gets all questions from the database.
     * @returns {Promise<Array>} - A promise that resolves to an array of all questions
     */
    getAllQuestions: async function() {
        try {
            const questions = await Question.find({}, { __v: 0 });
            return questions;
        } catch (error) {
            console.error('Error getting all questions:', error);
            throw new Error(error.message);
        }
    }
    
};