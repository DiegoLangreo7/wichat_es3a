import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Slider, Grid } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router";
import axios from "axios";
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';
import MovieIcon from '@mui/icons-material/Movie';
import PetsIcon from '@mui/icons-material/Pets';
import FlagIcon from '@mui/icons-material/Flag';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const MainQuestionGame = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });

    const [difficulty, setDifficulty] = useState<number>(1);
    const [selectedMode, setSelectedMode] = useState<string>("country");

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
        3: { label: "Excomulgado", time: 5, color: "#202A25" },
    };

    const gameModes = [
        { value: "country", label: "Geografía", icon: <PublicIcon fontSize="small" /> },
        { value: "flags", label: "Banderas", icon: <FlagIcon  fontSize="small" /> },
        { value: "science", label: "Ciencia", icon: <ScienceIcon fontSize="small" /> },
        { value: "sports", label: "Futbol", icon: <SportsSoccerIcon  fontSize="small" /> },
        { value: "animals", label: "Flora y fauna", icon: <PetsIcon fontSize="small" /> },
        { value: "cine", label: "Cine", icon: <MovieIcon fontSize="small" /> },
    ];

    const handleButtonClick = () => {
        const selected = difficultyMap[difficulty];

        navigate("/game", {
            state: {
                username,
                totalQuestions: 10,
                timeLimit: selected.time,
                gameMode: selectedMode
            }
        });
    };

    return (
        <Box component="main"
             sx={{
                 height: "100vh",
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "center",
                 backgroundColor: "#202A25",
                 padding: "0 8px",
                 overflow: "hidden",
                 boxSizing: "border-box"
             }}
        >
            <Box sx={{ width: "100%", position: "sticky", top: 0, zIndex: 1000 }}>
                <NavBar />
            </Box>

            <Box sx={{
                textAlign: "center",
                width: "80%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                pb: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                    display: "none"
                }
            }}>
                <Box sx={{ px: 1 }}>
                    <Typography variant="h5" sx={{
                        color: '#F7FFF7',
                        fontWeight: "bold",
                        mb: 2,
                        mt: 2,
                        fontSize: "1.4rem"
                    }}>
                        {username}, ¿Listo para jugar?
                    </Typography>

                    {/* Selector de modo de juego */}
                    <Paper sx={{
                        p: 1.5,
                        mb: 2,
                        borderRadius: "10px",
                        backgroundColor: '#F7FFF7',
                        width: "100%",
                        mx: "auto",
                        boxShadow: 2,
                        maxWidth: '90%'
                    }}>
                        <Typography variant="subtitle1" sx={{
                            mb: 1.5,
                            fontWeight: "bold",
                            color: "#5f4bb6",
                            fontSize: "1rem"
                        }}>
                            Modo de juego
                        </Typography>

                        <Grid container spacing={1}>
                            {gameModes.map((mode) => (
                                <Grid item xs={4} key={mode.value}>
                                    <Paper
                                        elevation={1}
                                        onClick={() => setSelectedMode(mode.value)}
                                        sx={{
                                            p: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            borderRadius: '8px',
                                            border: mode.value === selectedMode ? '2px solid #5f4bb6' : '1px solid #e0e0e0',
                                            backgroundColor: mode.value === selectedMode ? 'rgba(95, 75, 182, 0.1)' : 'white',
                                            minHeight: '80px',
                                            justifyContent: 'center',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            color: '#5f4bb6',
                                            backgroundColor: 'rgba(95, 75, 182, 0.1)',
                                            borderRadius: '50%',
                                            p: 0.8,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 36,
                                            height: 36,
                                            mb: 1
                                        }}>
                                            {mode.icon}
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "0.8rem" }}>
                                            {mode.label}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    {/* Selector de dificultad */}
                    <Paper sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: "10px",
                        backgroundColor: '#F7FFF7',
                        width: "100%",
                        mx: "auto",
                        boxShadow: 2,
                        maxWidth: '80%'
                    }}>
                        <Typography variant="subtitle1" sx={{
                            mb: 1.5,
                            fontWeight: "bold",
                            color: difficultyMap[difficulty].color,
                            fontSize: "1rem"
                        }}>
                            Dificultad: {difficultyMap[difficulty].label}
                        </Typography>
                        <Slider
                            value={difficulty}
                            min={0}
                            max={3}
                            step={1}
                            marks={[
                                { value: 0, label: "" },
                                { value: 1, label: "" },
                                { value: 2, label: "" },
                                { value: 3, label: "" },
                            ]}
                            onChange={(_, newValue) => setDifficulty(newValue as number)}
                            sx={{
                                color: difficultyMap[difficulty].color,
                                mb: 1,
                                px: 1,
                                maxWidth: '80%'
                            }}
                        />
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)', // 4 columnas de igual tamaño
                            gap: '10px', // Espacio entre elementos
                            justifyContent: 'space-evenly',
                            alignItems: 'center' // Alineación vertical si es necesario
                        }}>
                            {[0, 1, 2, 3].map((value) => (
                                <Typography key={value} variant="caption" sx={{
                                    color: difficulty === value ? difficultyMap[value].color : 'text.secondary',
                                    fontWeight: difficulty === value ? 'bold' : 'normal',
                                    fontSize: '0.7rem'
                                }}>
                                    {difficultyMap[value].label}
                                </Typography>
                            ))}
                        </Box>
                        <Typography variant="caption" sx={{
                            mt: 1,
                            color: 'text.secondary',
                            fontSize: "0.75rem",
                            display: "block"
                        }}>
                            Tiempo por pregunta: {difficultyMap[difficulty].time} segundos
                        </Typography>
                    </Paper>
                </Box>

                <Button
                    onClick={handleButtonClick}
                    sx={{
                        backgroundColor: "#5f4bb6",
                        color: "white",
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                        padding: "12px",
                        borderRadius: "8px",
                        boxShadow: 2,
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                            backgroundColor: "#EDC9FF",
                            transform: "scale(1.02)",
                        },
                        "&:active": {
                            transform: "scale(0.98)",
                        },
                        width: "50%",
                        mx: "auto",
                        mb: 1
                    }}
                >
                    🎮 JUGAR
                </Button>
            </Box>
        </Box>
    );
};

export default MainQuestionGame;