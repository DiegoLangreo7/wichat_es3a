// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model');
const Ranking = require('./ranking-model');

const app = express();
const port = 8001;

app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);


// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}
function validateFormatOfFields(username, password){
  const errors = [];

  if(username.length < 3){
    errors.push(`El nombre de usuario debe tener al menos 3 caracteres`)
  } 
  if (password.length < 8){
    errors.push(`La contraseña debe tener al menos 8 caracteres`)
  }
  else{
    if (!password.match(/[a-zA-Z]/g)){
      errors.push(`La contraseña debe contener al menos una letra`)
    }
    if (!password.match(/\d/g)){
      errors.push(`La contraseña debe contener al menos un número`)
    }
    if (!password.match(/[!@#$%^&*.]/g)){
      errors.push(`La contraseña debe contener al menos un caracter especial (!@#$%^&*.)`)
    }
    
  }
  
  if(errors.length > 0){
    throw new Error(errors.join('\n'))
  }
}

app.post('/adduser', async (req, res) => {
    try {
        // Check if required fields are present in the request body
        validateRequiredFields(req, ['username', 'password']);

        const user = await User.findOne({username: req.body.username});

        if(user){
          throw new Error(`El usuario ${req.body.username} ya existe`)
        }

        validateFormatOfFields(req.body.username, req.body.password)

        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });

        await newUser.save();
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }});

// Endpoint para registrar resultados
app.post('/registerResults', async (req, res) => {
  try {
    validateRequiredFields(req, ['username', 'correctAnswered', 'incorrectAnswered', 'gamesPlayed', 'timePlayed', 'puntuation']);

    const existingRanking = await Ranking.findOne({ username: req.body.username });

    if (existingRanking) {
      existingRanking.correctAnswered += req.body.correctAnswered;
      existingRanking.incorrectAnswered += req.body.incorrectAnswered;
      existingRanking.gamesPlayed += req.body.gamesPlayed;
      existingRanking.timePlayed += req.body.timePlayed;
      existingRanking.puntuation += req.body.puntuation;
      await existingRanking.save();
      res.json(existingRanking);
    } else {
      const newRanking = new Ranking({
        username: req.body.username,
        correctAnswered: req.body.correctAnswered,
        incorrectAnswered: req.body.incorrectAnswered,
        gamesPlayed: req.body.gamesPlayed,
        timePlayed: req.body.timePlayed,
        puntuation: req.body.puntuation
      });
      await newRanking.save();
      res.json(newRanking);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server