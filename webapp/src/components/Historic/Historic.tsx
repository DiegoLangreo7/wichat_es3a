import React, {useEffect, useState} from "react";
import NavBar from "../Main/items/NavBar";
import {Box, Button, CircularProgress, Paper, Typography} from "@mui/material";
import QuestionStat from "./items/QuestionStat";
import axios from "axios";

interface HistoricProps {
    username: string;
}

interface HistoricStats {
    timePlayed: number;
    gamesPlayed: number;
    correctAnswered: number;
    incorrectAnswered: number;
    puntuation: number;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8001';

const Historic: React.FC<HistoricProps> = ({username}) => {
    const [stats, setStats] = useState<HistoricStats>({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });

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

 return (<><NavBar/>
    <Box display='flex' flexDirection='column' justifyContent="center" alignItems="center" position="relative" mt={2} mb={3}>
        {/* 🔹 Sección de estadísticas */}
        <Paper elevation={3} sx={{
            mt: 1,
            padding: "20px",
            textAlign: "left",
            width: "60%",
            borderRadius: "10px",
            backgroundColor: "#F4F4F4"
        }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                📊 Estadísticas de {username.replace(/"/g, '')}
            </Typography>
            <Typography variant="body1">
                <b>Tiempo Jugado:</b> {stats.timePlayed} segundos
            </Typography>
            <Typography variant="body1">
                <b>Partidas Jugadas:</b> {stats.gamesPlayed}
            </Typography>
            <Typography variant="body1">
                <b>Puntuación total:</b> {stats.puntuation}
            </Typography>
            <Typography variant="body1" sx={{ color: "#4CAF50" }}>
                <b>Preguntas acertadas:</b> {stats.correctAnswered}
            </Typography>
            <Typography variant="body1" sx={{ color: "#F44336" }}>
                <b>Preguntas falladas:</b> {stats.incorrectAnswered}
            </Typography>
        </Paper>
    </Box>
     </>
 );
};

export default Historic;