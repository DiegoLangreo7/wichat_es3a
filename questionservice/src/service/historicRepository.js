const mongoose = require('mongoose');
const Historic = require('../model/historic');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
mongoose.connect(mongoUri);

module.exports = {
    getHistoricByUser: async function(userId) {
        try {
            return await Historic.find({user: userId});
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
    }
}

