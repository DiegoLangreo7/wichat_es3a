module.exports = {
    testMatch: ["**/steps/game-play.steps.js"],
    testTimeout: 30000,
    setupFilesAfterEnv: ["expect-puppeteer"]
}