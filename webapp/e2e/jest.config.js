module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["expect-puppeteer"],
    transform: {},
    testMatch: ["**/steps/*.js"],
    testTimeout: 30000,
}
