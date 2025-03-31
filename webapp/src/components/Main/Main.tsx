import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            // Se asume que el username se guarda en formato JSON en localStorage
            const storedUsername = localStorage.getItem("username");
            const username = storedUsername ? JSON.parse(storedUsername) : "";
            try {
                const response = await axios.get(`${apiEndpoint}/stats/${username}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats, intentando crear ranking:", error);
                try {
                    // Si no existe un ranking, se crea en la base de datos
                    const createResponse = await axios.post(`${apiEndpoint}/stats`, { username });
                    setStats(createResponse.data);
                } catch (createError) {
                    console.error("Error creando ranking:", createError);
                }
            }
        };

        fetchStats();
    }, []);

    const handleButtonClick = () => {
        navigate("/game");
    };

    // Recuperar el username de localStorage y parsearlo para eliminar las comillas adicionales
    const storedUsername = localStorage.getItem('username');
    const username = storedUsername ? JSON.parse(storedUsername) : "Jugador";

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
            <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>

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

            {/* Sección de estadísticas */}
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
