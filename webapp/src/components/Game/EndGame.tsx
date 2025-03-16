import React from 'react';
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

    return (
        <Box component="main" sx={{
                    margin: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
            <Box sx={{ width: '100%' }}>
                <NavBar />
            </Box>
            <Typography variant="h4" gutterBottom>
                ¡Juego Terminado!
            </Typography>
            <Typography variant="h6" gutterBottom>
                {username}Francisco, tu puntuación es: {score} / {totalQuestions}
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