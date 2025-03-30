import React, {useState} from "react";
import NavBar from "../Main/items/NavBar";
import {Box, Button, CircularProgress, Paper, Typography} from "@mui/material";
import QuestionStat from "./items/QuestionStat";

interface HistoricProps {
    username: string;
}

interface HistoricStats {
    totalTimePlayed: number;
    gamesPlayed: number;
    correctQuestions: number;
    incorrectQuestions: number;
    gameMode: string;
}

const Historic: React.FC<HistoricProps> = ({username}) => {
    const [stats, setStats] = useState<HistoricStats>({
        totalTimePlayed: 0,
        gamesPlayed: 0,
        correctQuestions: 0,
        incorrectQuestions: 0,
        gameMode: "Normal"
    });
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
                📊 Estadísticas de {username}
            </Typography>
            <Typography variant="body1"><b>Modo de Juego:</b> {stats.gameMode}</Typography>
            <Typography variant="body1"><b>Tiempo Jugado:</b> {stats.totalTimePlayed} segundos</Typography>
            <Typography variant="body1"><b>Partidas Jugadas:</b> {stats.gamesPlayed}</Typography>
            <Typography variant="body1" sx={{ color: "#4CAF50" }}><b>Preguntas acertadas:</b> {stats.correctQuestions} </Typography>
            <Typography variant="body1" sx={{ color: "#F44336" }}><b>Preguntas falladas:</b> {stats.incorrectQuestions} </Typography>
        </Paper>
    </Box>
     </>
 );
};

export default Historic;