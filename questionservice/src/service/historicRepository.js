const mongoose = require('mongoose');
const Historic = require('../model/historic');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
mongoose.connect(mongoUri);

module.exports = {
    getHistoricByUser: async function(username) {
        try {
            return await Historic.find({user: username});
        } catch (error) {
            console.error('Error retrieving historic:', error.message);
            throw error;
        }
    },
    saveHistoric: async function(historic) {
        try {
            const newHistoric = new Historic(historic);
            await newHistoric.save();
        } catch (error) {
            console.error('Error saving historic:', error.message);
            throw error;
        }
    },
    createNewHistoric: async function(username) {
        try {
            const newHistoric = new Historic({
                timesPlayed: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                timePlayed: 0,
                user: username,
                gameMode: "normal"
            });
            await newHistoric.save();
        } catch (error) {
            console.error('Error creating new historic:', error.message);
            throw error;
        }
    }
}

