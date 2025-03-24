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

    const calculateStats = async () => {
        try {
            // Obtener las estadísticas actuales del usuario
            const response = await axios.get(`${apiEndpoint}/ranking/${username}`);
            const currentStats = response.data;

            // Actualizar los valores
            const updatedStats = {
                correctAnswered: currentStats.correctAnswered + score,
                incorrectAnswered: currentStats.incorrectAnswered + (totalQuestions - score),
                gamesPlayed: currentStats.gamesPlayed + 1,
                timePlayed: currentStats.timePlayed + (timeLimit * totalQuestions),
            };

            // Guardar los valores actualizados en la base de datos
            await axios.put(`${apiEndpoint}/ranking/${username}`, updatedStats);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
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