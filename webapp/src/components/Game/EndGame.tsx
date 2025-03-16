import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

interface EndGameProps {
    username: string;
    totalQuestions: number;
    timeLimit: number;
    themes: { [key: string]: boolean };
    score: number; // Añadir esta línea
}

const EndGame: React.FC<EndGameProps> = ({ username, totalQuestions, timeLimit, themes, score }) => {
    const navigate = useNavigate();

    const handlePlayAgain = () => {
        navigate('/game'); // Navegar a la ruta del juego para volver a jugar
    };

    const handleBackToMenu = () => {
        navigate('/main'); // Navegar a la ruta del menú principal
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
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
        </Container>
    );
};

export default EndGame;