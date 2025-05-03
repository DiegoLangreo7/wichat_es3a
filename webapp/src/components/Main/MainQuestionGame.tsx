import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Slider, IconButton, Avatar } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router";
import axios from "axios";
import PublicIcon from '@mui/icons-material/Public';
import ScienceIcon from '@mui/icons-material/Science';
import MovieIcon from '@mui/icons-material/Movie';
import PetsIcon from '@mui/icons-material/Pets';
import FlagIcon from '@mui/icons-material/Flag';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const MainQuestionGame = () => {
    const navigate = useNavigate();
    const [, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });

    const [difficulty, setDifficulty] = useState<number>(1);
    const [selectedMode, setSelectedMode] = useState<string>("country");
    const [currentSlide, setCurrentSlide] = useState(0);

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
        { value: "country", label: "Geografía", icon: <PublicIcon />, color: "#AB825C", text: "#F7FFF7" },
        { value: "flags", label: "Banderas", icon: <FlagIcon />, color: "#EDC9FF", text: "#2A363B" },
        { value: "science", label: "Ciencia", icon: <ScienceIcon />, color: "#4B77BE", text: "#F7FFF7" },
        { value: "sports", label: "Futbol", icon: <SportsSoccerIcon />, color: "#4CAF50", text: "#F7FFF7" },
        { value: "cine", label: "Cine", icon: <MovieIcon />, color: "#FFA726", text: "#2A363B" },
        { value: "animals", label: "Flora y fauna", icon: <PetsIcon />, color: "#EF5350", text: "#F7FFF7" },
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

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === gameModes.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? gameModes.length - 1 : prev - 1));
    };

    const visibleCards = 3;
    const visibleModes = [];
    for (let i = 0; i < visibleCards; i++) {
        const index = (currentSlide + i) % gameModes.length;
        visibleModes.push(gameModes[index]);
    }

    return (
        <Box component="main"
             sx={{
                 height: "100vh",
                 display: "flex",
                 flexDirection: "column",
                 backgroundColor: "#202A25",
                 overflow: "hidden",
                 boxSizing: "border-box"
             }}
        >
            {/* NavBar con ancho completo */}
            <Box sx={{
                width: "100vw",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                left: 0,
                right: 0
            }}>
                <NavBar />
            </Box>

            {/* Contenido principal dividido en dos paneles */}
            <Box sx={{
                display: "flex",
                height: "calc(100vh - 64px)",
                width: "100vw",
                overflow: "hidden"
            }}>
                {/* Panel izquierdo - Carrusel de categorías */}
                <Box sx={{
                    width: "60%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2
                }}>
                    <Typography variant="h5" sx={{
                        color: '#F7FFF7',
                        fontWeight: "bold",
                        mb: 4,
                        fontSize: "1.6rem"
                    }}>
                        Elige una categoría
                    </Typography>

                    {/* Carrusel */}
                    <Box sx={{
                        maxHeight: "60%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        width: "100%"
                    }}>
                        <IconButton
                            onClick={prevSlide}
                            sx={{
                                position: "absolute",
                                left: 20,
                                color: "#F7FFF7",
                                zIndex: 1,
                                backgroundColor: "rgba(95, 75, 182, 0.7)",
                                "&:hover": {
                                    backgroundColor: "#5f4bb6"
                                },
                            }}
                        >
                            <ChevronLeftIcon fontSize="large" />
                        </IconButton>

                        <Box sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 3
                        }}>
                            {visibleModes.map((mode, index) => (
                                <Paper
                                    key={`${mode.value}-${index}`}
                                    onClick={() => setSelectedMode(mode.value)}
                                    sx={{
                                        width: "300px",
                                        height: "350px",
                                        backgroundColor: mode.color,
                                        color: mode.text,
                                        borderRadius: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        transition: "transform 0.3s",
                                        "&:hover": {
                                            transform: "scale(1.03)"
                                        },
                                        p: 3,
                                        position: "relative",
                                        boxShadow: 3,
                                        border: selectedMode === mode.value ? "3px solid #F7FFF7" : "none"
                                    }}
                                >
                                    <Avatar sx={{
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        width: 80,
                                        height: 80,
                                        mb: 3
                                    }}>
                                        {mode.icon}
                                    </Avatar>
                                    <Typography variant="h5" sx={{
                                        fontWeight: "bold",
                                        mb: 2,
                                        textAlign: "center"
                                    }}>
                                        {mode.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        textAlign: "center",
                                        mb: 2
                                    }}>
                                        {selectedMode === mode.value ? "✔ Seleccionada" : "Haz click para seleccionar"}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>

                        <IconButton
                            onClick={nextSlide}
                            sx={{
                                position: "absolute",
                                right: 20,
                                color: "#F7FFF7",
                                zIndex: 1,
                                backgroundColor: "rgba(95, 75, 182, 0.7)",
                                "&:hover": {
                                    backgroundColor: "#5f4bb6"
                                },
                            }}
                        >
                            <ChevronRightIcon fontSize="large" />
                        </IconButton>
                    </Box>

                    {/* Indicadores del carrusel */}
                    <Box sx={{
                        display: "flex",
                        gap: 1,
                        mt: 3,
                        justifyContent: "center"
                    }}>
                        {gameModes.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    backgroundColor: currentSlide === index ? "#5f4bb6" : "rgba(255,255,255,0.3)",
                                    cursor: "pointer",
                                    transition: "background-color 0.3s"
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Panel derecho - Configuración de juego */}
                <Box sx={{
                    width: "40%",
                    height: "100%",
                    backgroundColor: "#2A363B",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 4
                }}>
                    <Paper sx={{
                        p: 3,
                        borderRadius: "12px",
                        backgroundColor: '#5F4BB6',
                        width: "100%",
                        maxWidth: "400px",
                        boxShadow: 3,
                        mb: 3
                    }}>
                        <Typography variant="h6" sx={{
                            mb: 2,
                            fontWeight: "bold",
                            color: "#F7FFF7",
                            textAlign: "center"
                        }}>
                            {username}, ¿Listo para jugar?
                        </Typography>

                        {/* Selector de dificultad */}
                        <Box sx={{ mb: 3, backgroundColor: "rgba(247, 255, 247, .9)", borderRadius: "8px",
                            p: 2 }}>
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
                                    width: "90%",
                                    mx: "auto"
                                }}
                            />
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '10px',
                                justifyContent: 'space-evenly',
                                mb: 1
                            }}>
                                {[0, 1, 2, 3].map((value) => (
                                    <Typography key={value} variant="caption" sx={{
                                        color: difficulty === value ? difficultyMap[value].color : 'text.secondary',
                                        fontWeight: difficulty === value ? 'bold' : 'normal',
                                        fontSize: '0.7rem',
                                        textAlign: "center"
                                    }}>
                                        {difficultyMap[value].label}
                                    </Typography>
                                ))}
                            </Box>
                            <Typography variant="caption" sx={{
                                color: 'text.secondary',
                                fontSize: "0.75rem",
                                display: "block",
                                textAlign: "center"
                            }}>
                                Tiempo por pregunta: {difficultyMap[difficulty].time} segundos
                            </Typography>
                        </Box>

                        {/* Resumen de selección */}
                        <Box sx={{
                            backgroundColor: "rgba(237, 201, 255, 0.1)",
                            borderRadius: "8px",
                            p: 2,
                            mb: 3
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#F7FFF7", mb: 1 }}>
                                Resumen:
                            </Typography>
                            <Typography variant="body2" sx={{color: "#F7FFF7"}}>
                                Categoría: {gameModes.find(m => m.value === selectedMode)?.label}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#F7FFF7"}}>
                                Dificultad: {difficultyMap[difficulty].label}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#F7FFF7"}}>
                                Tiempo por pregunta: {difficultyMap[difficulty].time}s
                            </Typography>
                            <Typography variant="body2" sx={{color: "#F7FFF7"}}>
                                Total preguntas: 10
                            </Typography>
                        </Box>

                        <Button
                            onClick={handleButtonClick}
                            data-testid="play-button"
                            sx={{
                                backgroundColor: "#F7B801",
                                color: "#202A25",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                padding: "12px",
                                borderRadius: "8px",
                                boxShadow: 2,
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                    backgroundColor: "#202A25",
                                    transform: "scale(1.02)",
                                },
                                "&:active": {
                                    transform: "scale(0.98)",
                                },
                                width: "100%"
                            }}
                        >
                            🎮 JUGAR
                        </Button>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default MainQuestionGame;