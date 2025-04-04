import React, {useEffect, useState} from "react";
import NavBar from "../Main/items/NavBar";
import {Box, Button, CircularProgress, Paper, Typography} from "@mui/material";
import QuestionStat from "./items/QuestionStat";
import axios from "axios";

interface HistoricProps {
    username: string;
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    answer: string;
    imageUrl?: string;
    time: number;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const Historic: React.FC = () => {
    const user : string = localStorage.getItem("username") || "Usuario";
    const username : string = user === "Usuario" ? "Usuario" : user.slice(1, user.length-1);
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });

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

    const [questions, setQuestions] = useState<Question[]>([]);
    return (<Box sx = {{ backgroundColor: '#202A25', height: '100%'}}><NavBar/>
            <Box display='flex' flexDirection='column' justifyContent="center" alignItems="center" position="relative" mt={2} mb={3} >
                {/* 🔹 Sección de estadísticas */}
                <Paper elevation={3} sx={{
                    mt: 4,
                    padding: "20px",
                    textAlign: "center",
                    width: "80%",
                    maxWidth: "400px",
                    borderRadius: "10px",
                    backgroundColor: "#F7FFF7"
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
                {questions.map((q, index) => (
                    <QuestionStat question={q}/>
                ))}
            </Box>
        </Box>
    );
};

export default Historic;