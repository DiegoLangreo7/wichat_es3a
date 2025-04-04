import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Slider } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

            <Box sx={{ textAlign: "center", mt: 12 }}>
                <Typography variant="h4" sx={{ color: '#F7FFF7', fontWeight: "bold", mb: 3 }}>
                    {username}, ¿Listo para jugar?
                </Typography>

                {/* Selector de dificultad */}
                <Box sx={{ width: 250, mx: "auto", mb: 3 , backgroundColor : '#F7FFF7', borderRadius: "10px", padding: 5}}>
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
        </Box>
    );
};

export default Main;