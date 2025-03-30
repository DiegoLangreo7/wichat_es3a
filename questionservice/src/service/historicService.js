const historicData = require('./historicRepository');
const Historic = require('../model/historic');

function getHistoricByUser(userId) {
    return historicData.getHistoricByUser(userId);
}

function saveHistoric(historic) {
    historicData.saveHistoric(historic);
}

function addOneGameToHistoric(userId) {
    let historic = historicData.getHistoricByUser(userId);
    if (historic) {
        historic.timesPlayed += 1;
        historic.save();
    } else {
        const newHistoric = new Historic({
            timesPlayed: 1,
            correctAnswers: 0,
            incorrectAnswers: 0,
            timePlayed: 0,
            user: userId,
            gameMode: "normal"
        });
        historicData.saveHistoric(newHistoric);
    }
}

function addCorrectAnswerToHistoric(userId) {
    let historic = historicData.getHistoricByUser(userId);
    if (historic) {
        historic.correctAnswers += 1;
        historic.save();
    } else {
        console.error("No historic found for user:", userId);
    }
}

function addIncorrectAnswerToHistoric(userId) {
    let historic = historicData.getHistoricByUser(userId);
    if (historic) {
        historic.incorrectAnswers += 1;
        historic.save();
    } else {
        console.error("No historic found for user:", userId);
    }
}

function addTimePlayedToHistoric(userId, time) {
    let historic = historicData.getHistoricByUser(userId);
    if (historic) {
        historic.timePlayed += time;
        historic.save();
    } else {
        console.error("No historic found for user:", userId);
    }
}

