import { useEffect, useState } from "react";
import { Box, Button, Typography, Slider, ThemeProvider, createTheme } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '2rem',
      letterSpacing: '0.05em'
    },
    button: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '1.1rem',
    }
  },
});

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
    
    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const storedUsername = localStorage.getItem('username');
    const username = storedUsername ? JSON.parse(storedUsername) : "Jugador";

    const difficultyMap: Record<number, { label: string; time: number; color: string }> = {
        0: { label: "Fácil", time: 30, color: "#4CAF50" },
        1: { label: "Medio", time: 20, color: "#FFA726" },
        2: { label: "Difícil", time: 10, color: "#EF5350" },
    };

    const handleButtonClick = () => {
        const selected = difficultyMap[difficulty];
        navigate("/game", {
            state: {
                username,
                totalQuestions: 10,
                timeLimit: selected.time,
                themes: { geografía: true, historia: false }
            }
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box component="main"
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: 'center',
                    backgroundColor: "#202A25",
                }}
            >
                <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                    <NavBar />
                </Box>

                <Box sx={{ textAlign: "center", mt: 14, width: "90%", maxWidth: "600px" }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            color: '#F7FFF7', 
                            fontWeight: "bold", 
                            mb: 5,
                            textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                        }}
                    >
                        {username}, ¿Listo para jugar?
                    </Typography>

                    <Box 
                        sx={{ 
                            width: "70%", // Reducido del 100% al 70%
                            mx: "auto", 
                            mb: 5,
                            backgroundColor: '#F7FFF7', 
                            borderRadius: "15px",
                            padding: 3, // Reducido de 4 a 3
                            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)' // Sombra menos pronunciada
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                mb: 1.5, // Reducido de 2 a 1.5
                                fontWeight: "bold", 
                                color: difficultyMap[difficulty].color,
                                fontFamily: '"Press Start 2P", cursive',
                                fontSize: '0.85rem' // Reducido de 1rem a 0.85rem
                            }}
                        >
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
                                color: difficultyMap[difficulty].color,
                                height: 6, // Reducido de 8 a 6
                                '& .MuiSlider-thumb': {
                                    width: 20, // Reducido de 24 a 20
                                    height: 20, // Reducido de 24 a 20
                                },
                                '& .MuiSlider-markLabel': {
                                    fontFamily: '"Press Start 2P", cursive',
                                    fontSize: '0.7rem', // Reducido de 0.8rem a 0.7rem
                                    marginTop: '8px' // Reducido de 10px a 8px
                                },
                                '& .MuiSlider-rail': {
                                    height: 6 // Reducido de 8 a 6
                                },
                                '& .MuiSlider-track': {
                                    height: 6 // Reducido de 8 a 6
                                }
                            }}
                        />
                    </Box>

                    <Button
                        onClick={handleButtonClick}
                        sx={{
                            backgroundColor: "#5f4bb6",
                            color: "white",
                            fontFamily: '"Press Start 2P", cursive',
                            padding: "20px 40px",
                            borderRadius: "12px",
                            boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.3)",
                            transition: "all 0.3s ease-in-out",
                            fontSize: "1.2rem",
                            "&:hover": {
                                backgroundColor: "#EDC9FF",
                                transform: "scale(1.05)",
                                color: "#5f4bb6"
                            },
                            "&:active": {
                                transform: "scale(0.95)",
                            },
                            border: '6px solid rgba(0,0,0,0.2)',
                            textShadow: '3px 3px 0 rgba(0,0,0,0.4)'
                        }}
                    >
                        🎮 JUGAR
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Main;