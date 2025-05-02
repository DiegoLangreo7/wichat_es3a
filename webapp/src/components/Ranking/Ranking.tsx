import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar
} from "@mui/material";
import NavBar from "../Main/items/NavBar";
import axios from "axios";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8001';

interface StatEntry {
  username: string;
  puntuation: number;
}

const getMedalColor = (position: number) => {
  switch (position) {
    case 0: return "#FFD700"; // Oro
    case 1: return "#C0C0C0"; // Plata
    case 2: return "#CD7F32"; // Bronce
    default: return "#5f4bb6"; // Resto: morado como base
  }
};

const Ranking: React.FC = () => {
  const [ranking, setRanking] = useState<StatEntry[]>([]);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const parsedUsername = storedUsername ? JSON.parse(storedUsername) : "";
    setUsername(parsedUsername);

    const fetchRanking = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/getStats`);
        const sorted = response.data.sort(
          (a: StatEntry, b: StatEntry) => b.puntuation - a.puntuation
        );
        setRanking(sorted);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      }
    };

    fetchRanking();
  }, []);

  return (
    <Box
      id="ranking-component"
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#202A25",
      }}
    >
      <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
        <NavBar />
      </Box>

      <Typography
        variant="h4"
        sx={{
          mt: 10,
          mb: 4,
          fontWeight: "bold",
          color: "#F7FFF7",
          textAlign: "center",
          letterSpacing: 1,
          textTransform: "uppercase"
        }}
      >
        Ranking de Jugadores
      </Typography>

      <Box sx={{ width: "90%", maxWidth: 600 }}>
        {ranking.map((entry, index) => {
          const isTop3 = index < 3;
          const isCurrentUser = entry.username === username;

          return (
            <Paper
              key={entry.username}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: isCurrentUser ? "#F7FFF7" : "#5f4bb6",
                color: isCurrentUser ? "#2A363B" : "#F7FFF7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                borderLeft: isTop3
                  ? `4px solid ${getMedalColor(index)}`
                  : "4px solid #F7FFF7"
              }}
            >
              <Avatar
                sx={{
                  bgcolor: isTop3 ? getMedalColor(index) : "#F7FFF7",
                  color: isTop3 ? "#000" : "#2A363B",
                  width: 32,
                  height: 32,
                  mr: 2,
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}
              >
                {index + 1}
              </Avatar>
              <Box>
                <Typography fontWeight="bold">{entry.username}</Typography>
                <Typography variant="body2">Puntos: {entry.puntuation}</Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default Ranking;