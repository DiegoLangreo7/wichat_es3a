import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Slider, ToggleButtonGroup, ToggleButton } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';
import MovieIcon from '@mui/icons-material/Movie';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const Main = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });

    const [difficulty, setDifficulty] = useState<number>(1);
    const [gameMode, setGameMode] = useState<string>("geografía");

    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

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

    const storedUsername = localStorage.getItem('username');
    const username = storedUsername ? JSON.parse(storedUsername) : "Jugador";

    const difficultyMap: Record<number, { label: string; time: number; color: string }> = {
        0: { label: "Fácil", time: 30, color: "#4CAF50" },
        1: { label: "Medio", time: 20, color: "#FFA726" },
        2: { label: "Difícil", time: 10, color: "#EF5350" },
    };

    const gameModes = [
        { value: "geografía", label: "Geografía", icon: <PublicIcon /> },
        { value: "historia", label: "Historia", icon: <HistoryIcon /> },
        { value: "ciencia", label: "Ciencia", icon: <ScienceIcon /> },
        { value: "cine", label: "Cine", icon: <MovieIcon /> }
    ];

    const handleModeChange = (
        event: React.MouseEvent<HTMLElement>,
        newMode: string,
    ) => {
        if (newMode !== null) {
            setGameMode(newMode);
        }
    };

    const handleButtonClick = () => {
        const selected = difficultyMap[difficulty];
        
        // Crear objeto de temas basado en el modo seleccionado
        const themes: Record<string, boolean> = {};
        gameModes.forEach(mode => {
            themes[mode.value] = mode.value === gameMode;
        });
        
        navigate("/game", {
            state: {
                username,
                totalQuestions: 10,
                timeLimit: selected.time,
                themes: themes
            }
        });
    };

    return (
        <Box component="main"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#202A25",
            }}
        >
            <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>

            <Box sx={{ textAlign: "center", mt: 12 }}>
                <Typography variant="h4" sx={{ color: '#F7FFF7', fontWeight: "bold", mb: 3 }}>
                    {username}, ¿Listo para jugar?
                </Typography>

                {/* Selector de modo de juego */}
                <Box sx={{ width: 350, mx: "auto", mb: 3, backgroundColor: '#F7FFF7', borderRadius: "10px", padding: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: "bold" }}>
                        Modo de juego
                    </Typography>
                    <ToggleButtonGroup
                        value={gameMode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="modo de juego"
                        sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            justifyContent: 'center',
                            '& .MuiToggleButton-root': {
                                margin: '4px',
                                borderRadius: '8px',
                                border: '2px solid',
                                fontFamily: '"Press Start 2P", cursive',
                                fontSize: '0.7rem',
                                padding: '8px 12px',
                                '&.Mui-selected': {
                                    backgroundColor: '#5f4bb6',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#4a3a9f'
                                    }
                                }
                            }
                        }}
                    >
                        {gameModes.map((mode) => (
                            <ToggleButton 
                                key={mode.value} 
                                value={mode.value}
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    gap: '5px',
                                    width: '130px'
                                }}
                            >
                                {mode.icon}
                                {mode.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {/* Selector de dificultad */}
                <Box sx={{ width: 300, mx: "auto", mb: 3, backgroundColor: '#F7FFF7', borderRadius: "10px", padding: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: "bold", color: difficultyMap[difficulty].color }}>
                        Dificultad: {difficultyMap[difficulty].label}
                    </Typography>
                    <Slider
                        value={difficulty}
                        min={0}
                        max={2}
                        step={1}
                        marks={[
                            { value: 0, label: "Fácil" },
                            { value: 1, label: "Medio" },
                            { value: 2, label: "Difícil" },
                        ]}
                        onChange={(_, newValue) => setDifficulty(newValue as number)}
                        sx={{
                            color: difficultyMap[difficulty].color
                        }}
                    />
                </Box>

                <Button
                    onClick={handleButtonClick}
                    sx={{
                        backgroundColor: "#5f4bb6",
                        color: "white",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        padding: "16px 32px",
                        borderRadius: "8px",
                        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                            backgroundColor: "#EDC9FF",
                            transform: "scale(1.05)",
                        },
                        "&:active": {
                            transform: "scale(0.95)",
                        },
                    }}
                >
                    🎮 JUGAR
                </Button>
            </Box>

            <Paper elevation={3} sx={{
                mt: 4,
                padding: "20px",
                textAlign: "center",
                width: "80%",
                maxWidth: "400px",
                borderRadius: "10px",
                backgroundColor: "#F7FFF7",
                mb: 4
            }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                    📊 Estadísticas
                </Typography>
                <Typography variant="body1">
                    <b>Tiempo Jugado:</b> {stats.timePlayed} segundos
                </Typography>
                <Typography variant="body1">
                    <b>Partidas Jugadas:</b> {stats.gamesPlayed}
                </Typography>
                <Typography variant="body1">
                    <b>Puntuacion total:</b> {stats.puntuation}
                </Typography>
                <Typography variant="body1" sx={{ color: "#4CAF50" }}>
                    <b>Preguntas acertadas:</b> {stats.correctAnswered}
                </Typography>
                <Typography variant="body1" sx={{ color: "#F44336" }}>
                    <b>Preguntas falladas:</b> {stats.incorrectAnswered}
                </Typography>
            </Paper>
        </Box>
    );
};

export default Main;