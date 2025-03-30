const mongoose = require('mongoose');
const Ranking = require('./ranking-model');

// Conectar a la base de datos de MongoDB
mongoose.connect('mongodb://localhost:27017/rankingdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const getRankingByUsername = async (username) => {
    try {
        const ranking = await Ranking.findOne({ username });
        if (!ranking) {
            throw new Error('Usuario no encontrado');
        }
        return ranking;
    } catch (error) {
        throw new Error(`Error al obtener el ranking: ${error.message}`);
    }
};

const updateRankingByUsername = async (username, updates) => {
    try {
        const ranking = await Ranking.findOneAndUpdate({ username }, updates, { new: true, upsert: true });
        return ranking;
    } catch (error) {
        throw new Error(`Error al actualizar el ranking: ${error.message}`);
    }
};

const getGeneralRanking = async () => {
    try {
        const rankings = await Ranking.find().sort({ puntuation: -1 });
        return rankings;
    } catch (error) {
        throw new Error(`Error al obtener el ranking general: ${error.message}`);
    }
};

module.exports = {
    getRankingByUsername,
    updateRankingByUsername,
    getGeneralRanking,
};