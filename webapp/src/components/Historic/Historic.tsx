import React, { useEffect, useState } from "react";
import NavBar from "../Main/items/NavBar";
import { Box, Paper, Typography } from "@mui/material";
import QuestionStat from "./items/QuestionStat";
import axios from "axios";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '1.2rem', // La fuente pixel suele necesitar un tamaño más pequeño
      letterSpacing: '0.05em'
    }
  },
});

interface HistoricProps {
    username: string;
}

interface Question {
    options: [string],
    correctAnswer: string,
    answer: string,
    category: string,
    imageUrl: string,
    user: string,
    time: number
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
//const historicEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8007';

const Historic: React.FC = () => {
    const user: string = localStorage.getItem("username") || "Usuario";
    const username: string = user === "Usuario" ? "Usuario" : user.slice(1, user.length - 1);
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });
    const [questions, setQuestions] = useState<Question[]>([]);


    useEffect(() => {
        const fetchStats = async () => {
            const storedUsername = localStorage.getItem("username");
            const username = storedUsername ? JSON.parse(storedUsername) : "";
            try {
                const response = await axios.get(`${apiEndpoint}/stats/${username}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats, intentando crear ranking:", error);
                try {
                    const createResponse = await axios.post(`${apiEndpoint}/stats`, { username });
                    setStats(createResponse.data);
                } catch (createError) {
                    console.error("Error creando ranking:", createError);
                }
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        // Función para obtener usuarios
        const fetchQuestions = async () => {
            try {
                console.log("Sacando historial");
                const response = await axios.get(`${apiEndpoint}/historic/${username}`);
                setQuestions(response.data);
            } catch (err: any) {
                console.error('Error fetching users:', err);

            }

    };
        fetchQuestions();}, [username]);



    return (
        <ThemeProvider theme={theme}>
            <Box id="historic-page-container"
                sx={{
                    backgroundColor: '#202A25',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <NavBar />
                <Box
                    id="historic-container"
                    display='flex' 
                    flexDirection='column' 
                    justifyContent="flex-start" 
                    alignItems="center"
                    sx={{
                        flex: 1,
                        width: '100%',
                        padding: 2,
                        paddingTop: 4,
                        paddingBottom: 4
                    }}
                >
                    {/* 🔹 Sección de estadísticas */}
                    <Paper
                        id="statistics-paper"
                        elevation={3} 
                        sx={{
                            padding: "20px",
                            textAlign: "center",
                            width: "100%",
                            maxWidth: "600px",
                            borderRadius: "10px",
                            backgroundColor: "#F7FFF7",
                            marginBottom: 4
                        }}
                    >
                        <Typography
                            id="statistics-title"
                            variant="h5" 
                            sx={{ 
                                fontWeight: "bold", 
                                mb: 2,
                                textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                                color: '#2c3e50'
                            }}
                        >
                            📊 Estadísticas
                        </Typography>
                        <Typography id="statistics-time" variant="body1">
                            <b>Tiempo Jugado:</b> {stats.timePlayed} segundos
                        </Typography>
                        <Typography id="statistics-games" variant="body1">
                            <b>Partidas Jugadas:</b> {stats.gamesPlayed}
                        </Typography>
                        <Typography id="statistics-score" variant="body1">
                            <b>Puntuacion total:</b> {stats.puntuation}
                        </Typography>
                        <Typography id="statistics-right-answers" variant="body1" sx={{ color: "#4CAF50" }}>
                            <b>Preguntas acertadas:</b> {stats.correctAnswered}
                        </Typography>
                        <Typography id="statistics-wrong-answers" variant="body1" sx={{ color: "#F44336" }}>
                            <b>Preguntas falladas:</b> {stats.incorrectAnswered}
                        </Typography>
                    </Paper>
                    
                    {/* Contenedor para la lista de preguntas */}
                    <Box
                        id="questions-container"
                        sx={{
                            width: '100%',
                            maxWidth: '600px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {questions.length > 0 ? (
                            questions.map((q, index) => (
                                <QuestionStat key={index} question={q} />
                            ))
                        ) : (
                            <Paper
                                id="no-questions-paper"
                                elevation={2} 
                                sx={{
                                    padding: "15px",
                                    textAlign: "center",
                                    backgroundColor: "#F0F4F8",
                                    borderRadius: "10px"
                                }}
                            >
                                <Typography id="no-questions-text" variant="body1" color="textSecondary">
                                    No hay historial de preguntas disponible
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Historic;