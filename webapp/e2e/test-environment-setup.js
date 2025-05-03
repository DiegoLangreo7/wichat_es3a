const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoserver;
let userservice;
let authservice;
let llmservice;
let questionservice;
let historicservice;
let cardservice;
let gatewayapiservice;
let gatewayservice;
let cardservice;

async function startServer() {
    console.log('Starting MongoDB memory server...');
    mongoserver = await MongoMemoryServer.create();
    const mongoUri = mongoserver.getUri();
    process.env.MONGODB_URI = mongoUri;
    userservice = await require("../../users/userservice/user-service");
    authservice = await require("../../users/authservice/auth-service");
    llmservice = await require("../../llmservice/llm-service");
    questionservice = await require("../../questionservice/src/service/questionService");
    historicservice = await require("../../historicservice/historicService");
    cardservice = await require("../../cardservice/cardService");
    gatewayservice = await require("../../gatewayservice/gateway-service");
    gatewayapiservice = await require("../../gateway-api-service/gateway-api-service");
    cardservice = await require("../../cardservice/cardService");
}

startServer();
