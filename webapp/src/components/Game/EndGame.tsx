import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import axios from 'axios';
import NavBar from "../Main/items/NavBar";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

interface EndGameProps {
    username: string;
    totalQuestions: number;
    timeLimit: number;
    themes: { [key: string]: boolean };
    score: number;
    correctAnswers: number;
    totalTimePlayed: number;
}

const EndGame: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { username, totalQuestions, timeLimit, themes, score, correctAnswers, totalTimePlayed } = location.state as EndGameProps;

    const handlePlayAgain = () => {
        navigate('/game');
    };

    const handleBackToMenu = () => {
        navigate('/main');
    };

    useEffect(() => {
        const calculateAndSendStats = async () => {
            // Obtener estadísticas anteriores del localStorage
            let correctQuestions = parseInt(localStorage.getItem('correctQuestions') || '0');
            let incorrectQuestions = parseInt(localStorage.getItem('incorrectQuestions') || '0');
            let gamesplayed = parseInt(localStorage.getItem('gamesplayed') || '0');
            let secondsPlayed = parseInt(localStorage.getItem('secondsPlayed') || '0');

            // Actualizar los valores
            correctQuestions += score;
            incorrectQuestions += (totalQuestions - score);
            gamesplayed += 1;
            secondsPlayed += timeLimit * totalQuestions;

            // Guardar de nuevo en localStorage por si quieres conservarlos ahí también
            localStorage.setItem('correctQuestions', correctQuestions.toString());
            localStorage.setItem('incorrectQuestions', incorrectQuestions.toString());
            localStorage.setItem('gamesplayed', gamesplayed.toString());
            localStorage.setItem('secondsPlayed', secondsPlayed.toString());

            // Enviar los datos al backend
            try {
                await axios.post(`${apiEndpoint}/registerResults`, {
                    username,
                    correctAnswered: score,
                    incorrectAnswered: totalQuestions - score,
                    gamesPlayed: 1,
                    timePlayed: timeLimit * totalQuestions,
                    puntuation: score
                });
            } catch (error) {
                console.error("Error registrando resultados:", error);
            }
        };

        calculateAndSendStats();
    }, []);

    return (
        <Box component="main" sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        }}>
            <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>
            <Typography variant="h4" gutterBottom>
                ¡Juego Terminado!
            </Typography>
            <Typography variant="h6" gutterBottom>
                {username}, tu puntuación es: {score.toFixed(2)} / {totalQuestions * 100}
            </Typography>
            <Typography variant="h6" gutterBottom>
                Preguntas acertadas: {correctAnswers}
            </Typography>
            <Box mt={4}>
                <Button variant="contained" color="primary" onClick={handlePlayAgain} sx={{ mr: 2 }}>
                    Volver a Jugar
                </Button>
                <Button variant="contained" color="secondary" onClick={handleBackToMenu}>
                    Volver al Menú
                </Button>
            </Box>
        </Box>
    );
};

export default EndGame;