import { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import NavBar from "../Main/items/NavBar";
import axios from "axios";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8001';

interface StatEntry {
  username: string;
  puntuation: number;
}

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
        const sorted = response.data.sort((a: StatEntry, b: StatEntry) => b.puntuation - a.puntuation);
        setRanking(sorted);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      }
    };

    fetchRanking();
  }, []);

  const userIndex = ranking.findIndex((entry) => entry.username === username);

  const top3 = ranking.slice(0, 3);
  const contextStart = Math.max(userIndex - 2, 3);
  const contextEnd = Math.min(userIndex + 3, ranking.length);
  const contextAroundUser = userIndex >= 3 ? ranking.slice(contextStart, contextEnd) : [];

  const getMedalEmoji = (position: number) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return "";
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
        <NavBar />
      </Box>

      <Typography variant="h4" sx={{ mt: 10, mb: 4, fontWeight: "bold" }}>
        🏆 Ranking Global
      </Typography>

      <Paper elevation={4} sx={{ width: "90%", maxWidth: 600, p: 2, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Posición</strong></TableCell>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell><strong>Puntuación</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {top3.map((entry, index) => {
              const isCurrentUser = entry.username === username;
              return (
                <TableRow
                  key={entry.username}
                  sx={{
                    backgroundColor: isCurrentUser ? "#E3F2FD" : "#FFFFFF",
                    fontWeight: isCurrentUser ? "bold" : "normal"
                  }}
                >
                  <TableCell>{getMedalEmoji(index)} {index + 1}</TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell>{entry.puntuation}</TableCell>
                </TableRow>
              );
            })}
            {contextAroundUser.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={3} align="center">...</TableCell>
                </TableRow>
                {contextAroundUser.map((entry, index) => {
                  const globalIndex = contextStart + index;
                  const isCurrentUser = entry.username === username;
                  return (
                    <TableRow
                      key={entry.username}
                      sx={{
                        backgroundColor: isCurrentUser ? "#E3F2FD" : "#FFFFFF",
                        fontWeight: isCurrentUser ? "bold" : "normal",
                      }}
                    >
                      <TableCell>{globalIndex + 1}</TableCell>
                      <TableCell>{entry.username}</TableCell>
                      <TableCell>{entry.puntuation}</TableCell>
                    </TableRow>
                  );
                })}
              </>
            )}
            {ranking.length === 1 && (
              <TableRow sx={{ backgroundColor: "#E3F2FD" }}>
                <TableCell>1</TableCell>
                <TableCell>{username}</TableCell>
                <TableCell>{ranking[0].puntuation}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Ranking;