const mongoose = require('mongoose');
const Question = require('../model/question');

// Conexión a la base de datos MongoDB.
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
mongoose.connect(mongoUri);

module.exports = {
    /**
     * Obtiene el número total de preguntas pertenecientes a una categoría dada.
     * @param {string} category - Nombre de la categoría.
     * @returns {Promise<number>} - Número de preguntas encontradas.
     */
    getNumberQuestionsByCategory: async function(category){
        try {
            const numberQuestions = await Question.countDocuments({ category: category });
            return numberQuestions;
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Guarda una nueva pregunta en la base de datos.
     * @param {Object} question - Objeto con los datos de la pregunta a guardar.
     * @returns {Promise<void>}
     */
    saveQuestion: async function(question){
        try {
            const newQuestion = new Question(question);
            await newQuestion.save();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Obtiene todas las URLs de imágenes asociadas a las preguntas de una categoría.
     * @param {string} category - Categoría por la cual filtrar las preguntas.
     * @returns {Promise<{ urls: Set<string> }>} - Conjunto de URLs encontradas.
     */
    getExistingImages: async function(category){
        const questions = await QuestionModel.find({ category }, { imageUrl: 1 });
        const urls = new Set(questions.map(q => q.imageUrl));
        return { urls };
    },

    /**
     * Inserta en la base de datos un conjunto de preguntas en lote.
     * @param {Array<Object>} questions - Lista de preguntas a guardar.
     * @returns {Promise<void>}
     */
    saveQuestionsBatch: async function (questions) {
        if (!Array.isArray(questions) || questions.length === 0) return;

        try {
            await Question.insertMany(questions);
            console.log(`${questions.length} preguntas guardadas`);
        } catch (error) {
            console.error("Error guardando preguntas en lote:", error.message);
        }
    },

    /**
     * Elimina una pregunta a partir de su ID.
     * @param {string} id - ID del documento a eliminar.
     * @returns {Promise<string|undefined>} - Devuelve el mensaje de error si falla.
     */
    deleteQuestionById: async function(id) {
        try {
            await Question.findByIdAndDelete(id);
            console.log(`Question ${id} deleted successfully`);
        } catch (error) {
            console.error('Error eliminando la pregunta:', error.message);
            return error.message;
        }
    },

    /**
     * Obtiene una pregunta aleatoria dentro de una categoría específica.
     * @param {string} categoryParam - Categoría por la cual filtrar.
     * @returns {Promise<Object|null>} - Pregunta aleatoria o null si no hay ninguna.
     */
    getRandomQuestionByCategory: async function(categoryParam) {
        try {
            const question = await Question.aggregate([
                { $match: { category: categoryParam } },
                { $sample: { size: 1 } }
            ]);
            return question.length > 0 ? question[0] : null;
        } catch (error) {
            console.error("Error obteniendo pregunta aleatoria:", error);
            throw new Error(error.message);
        }
    },

    /**
     * Obtiene todas las preguntas almacenadas en la base de datos.
     * @returns {Promise<Array<Object>>} - Lista de todas las preguntas.
     */
    getAllQuestions: async function() {
        try {
            const questions = await Question.find({}, { __v: 0 });
            return questions;
        } catch (error) {
            console.error('Error obteniendo todas las preguntas:', error);
            throw new Error(error.message);
        }
    }
};
