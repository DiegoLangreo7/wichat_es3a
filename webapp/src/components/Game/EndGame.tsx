import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import NavBar from "../Main/items/NavBar";

interface EndGameProps {
    username: string;
    totalQuestions: number;
    timeLimit: number;
    themes: { [key: string]: boolean };
    score: number;
}

const EndGame: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { username, totalQuestions, timeLimit, themes, score } = location.state as EndGameProps;

    const handlePlayAgain = () => {
        navigate('/game'); // Navegar a la ruta del juego para volver a jugar
    };

    const handleBackToMenu = () => {
        navigate('/main'); // Navegar a la ruta del menú principal
    };

    const calculateStats = () => {
        // Suponiendo que 'score' y 'totalQuestions' son variables ya definidas
        let correctQuestions = parseInt(localStorage.getItem('correctQuestions') || '0');
        let incorrectQuestions = parseInt(localStorage.getItem('incorrectQuestions') || '0');
        let gamesplayed = parseInt(localStorage.getItem('gamesplayed') || '0');
        let secondsPlayed = parseInt(localStorage.getItem('secondsPlayed') || '0');

        // Actualizar los valores
        correctQuestions += score;
        incorrectQuestions += (totalQuestions - score);
        gamesplayed += 1;
        secondsPlayed += timeLimit * totalQuestions;

        // Guardar los valores actualizados en localStorage
        localStorage.setItem('correctQuestions', correctQuestions.toString());
        localStorage.setItem('incorrectQuestions', incorrectQuestions.toString());
        localStorage.setItem('gamesplayed', gamesplayed.toString());
        localStorage.setItem('secondsPlayed', secondsPlayed.toString());
    };

    useEffect(() => {
        calculateStats(); // Llamar a calculateStats cuando el componente se monte
    }, []);

    return (
        <Box component="main" sx={{
            height: '100vh', // Ocupa toda la altura de la pantalla
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
                {username}, tu puntuación es: {score} / {totalQuestions}
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