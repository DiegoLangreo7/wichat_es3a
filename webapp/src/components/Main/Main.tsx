import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"; 

const Main = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctQuestions: 0,
        incorrectQuestions: 0
    });

    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
          navigate("/login");
        }
      }, [isAuthenticated, navigate]);

    // 🔹 Obtener estadísticas del servidor
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const username = (localStorage.getItem("username") || "{}");
                const response = await axios.get(`${apiEndpoint}/stats/${username}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);

    // 🔹 Obtener estadísticas de preguntas acertadas y falladas del localStorage
    useEffect(() => {
        const correctQuestions = parseInt(localStorage.getItem('correctQuestions') || '0');
        const incorrectQuestions = parseInt(localStorage.getItem('incorrectQuestions') || '0');
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
        const secondsPlayed = parseInt(localStorage.getItem('timePlayed') || '0');
        setStats(prevStats => ({
            ...prevStats,
            correctQuestions: correctQuestions,
            incorrectQuestions: incorrectQuestions,
            gamesPlayed: gamesPlayed,
            totalTimePlayed: secondsPlayed
        }));
    }, []);

    const handleButtonClick = () => {
        navigate("/game");
    };

    const username = JSON.parse(localStorage.getItem('username')|| 'Jugador');

    return (
        <Box component="main"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
            }}
        >
            {/* 🔹 NavBar fijo arriba */}
            <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>

            {/* 🔹 Botón de jugar */}
            <Box sx={{ textAlign: "center", mt: 12 }}>
                <Typography variant="h4" sx={{ color: "#1E293B", fontWeight: "bold", mb: 3 }}>
                    {username}, ¿Listo para jugar?
                </Typography>

                <Button
                    onClick={handleButtonClick}
                    sx={{
                        backgroundColor: "#1976D2",
                        color: "white",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        padding: "16px 32px",
                        borderRadius: "8px",
                        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                            backgroundColor: "#1565C0",
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

            {/* 🔹 Sección de estadísticas */}
            <Paper elevation={3} sx={{
                mt: 4,
                padding: "20px",
                textAlign: "center",
                width: "80%",
                maxWidth: "400px",
                borderRadius: "10px",
                backgroundColor: "#F4F4F4"
            }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                    📊 Estadísticas
                </Typography>
                <Typography variant="body1"><b>Tiempo Jugado:</b> {stats.timePlayed} segundos</Typography>
                <Typography variant="body1"><b>Partidas Jugadas:</b> {stats.gamesPlayed}</Typography>
                <Typography variant="body1" sx={{ color: "#4CAF50" }}><b>Preguntas acertadas:</b> {stats.correctQuestions}</Typography>
                <Typography variant="body1" sx={{ color: "#F44336" }}><b>Preguntas falladas:</b> {stats.incorrectQuestions}</Typography>
            </Paper>
        </Box>
    );
};

export default Main;