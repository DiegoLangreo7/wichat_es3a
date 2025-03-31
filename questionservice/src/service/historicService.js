const historicData = require('./historicRepository');
const Historic = require('../model/historic');

async function getHistoricByUser(username) {
    let historic = historicData.getHistoricByUser(username);
    if (!historic) {
        await historicData.createNewHistoric(username);
    }
    return historic;
}

async function saveHistoric(historic) {
    await historicData.saveHistoric(historic);
}

async function addOneGameToHistoric(username) {
    let historic = historicData.getHistoricByUser(username);
    if (historic) {
        historic.timesPlayed += 1;
        historic.save();
    } else {
        const newHistoric = new Historic({
            timesPlayed: 1,
            correctAnswers: 0,
            incorrectAnswers: 0,
            timePlayed: 0,
            user: username,
            gameMode: "normal"
        });
        await historicData.saveHistoric(newHistoric);
    }
}

async function addCorrectAnswerToHistoric(username) {
    let historic = historicData.getHistoricByUser(username);
    if (historic) {
        historic.correctAnswers += 1;
        historic.save();
    } else {
        console.error("No historic found for user:", username);
    }
}

async function addIncorrectAnswerToHistoric(username) {
    let historic = historicData.getHistoricByUser(username);
    if (historic) {
        historic.incorrectAnswers += 1;
        historic.save();
    } else {
        console.error("No historic found for user:", username);
    }
}

async function addTimePlayedToHistoric(username, time) {
    let historic = historicData.getHistoricByUser(username);
    if (historic) {
        historic.timePlayed += time;
        historic.save();
    } else {
        console.error("No historic found for user:", username);
    }
}

module.exports = {
    getHistoricByUser,
    saveHistoric,
    addOneGameToHistoric,
    addCorrectAnswerToHistoric,
    addIncorrectAnswerToHistoric,
    addTimePlayedToHistoric
}

