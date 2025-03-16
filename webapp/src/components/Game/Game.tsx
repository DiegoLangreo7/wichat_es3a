import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { Container, Typography, Button, Snackbar, Grid, List, ListItem, ListItemText, Box, CircularProgress } from '@mui/material';
import cryptoRandomString from 'crypto-random-string';
// @ts-ignore
import Question from "./Question/Question";
import NavBar from "../Main/items/NavBar";

interface GameProps {
    username: string;
    totalQuestions: number;
    timeLimit: number;
    themes: { [key: string]: boolean };
}

interface Question {
    questionBody: string;
    correcta: string;
    incorrectas: string[];
}

const Game: React.FC<GameProps> = ({ username, totalQuestions, timeLimit, themes }) => {
    // Si las props numéricas no son válidas se asignan valores por defecto
    const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;
    const timeLimitFixed = isNaN(timeLimit) || timeLimit <= 0 ? 180 : timeLimit;
    const TOTAL_ROUNDS = totalQuestionsFixed;
    const TRANSITION_ROUND_TIME = 5000;

    const [correctQuestions, setCorrectQuestions] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [numberClics, setNumberClics] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [almacenado, setAlmacenado] = useState<boolean>(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);

    const [questionData, setQuestionData] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    useEffect(() => {
        const interval = setInterval(() => {
            if (timer >= timeLimitFixed) {
                setFinished(true);
            } else if (!finished) {
                setTimer(prevTimer => prevTimer + 1);
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, questionData, imageLoaded]);

    const handleTimeRemaining = (): string => {
        const remaining = timeLimitFixed - timer;
        const minsR = Math.floor(remaining / 60);
        const secsR = remaining % 60;
        const secsRStr = secsR < 10 ? '0' + secsR.toString() : secsR.toString();
        return `${secsRStr}`;
    };

    const handleNextRound = () => {
        if (round < TOTAL_ROUNDS) {
            setRound(prevRound => prevRound + 1);
        } else {
            setFinished(true);
        }
    };

    const handleCorrectAnswer = () => {
        setScore(prevScore => prevScore + 1);
        handleNextRound();
    };

    useEffect(() => {
        if (finished) {
            navigate('/endGame', { state: { score, username, totalQuestions, timeLimit, themes } });
        }
    }, [finished, navigate, score, username, totalQuestions, timeLimit, themes]);

    useEffect(() => {

    }, [
        timer,
        finished,
        totalQuestionsFixed,
        timeLimitFixed,
        almacenado,
        apiEndpoint,
        correctQuestions,
        username,
        themes,
    ]);

    return (
        <Box component="main" sx={{
            margin: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Box sx={{ width: '100%' }}>
                <NavBar />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" position="relative" mb={3}>
                <CircularProgress variant="determinate" value={(timer / timeLimitFixed) * 100} size={80} />
                <Typography 
                    variant="h6" 
                    sx={{
                        position: "absolute",
                        fontWeight: "bold",
                        color: 'black',
                    }}
                >
                    {handleTimeRemaining()}
                </Typography>
            </Box>
            <Question totalQuestions={totalQuestionsFixed} themes={themes} onCorrectAnswer={handleCorrectAnswer} onNextRound={handleNextRound} />

            <Box display="flex" justifyContent="center" mt={3}>
                <Button variant="contained" color="secondary" size="large" onClick={() => alert('Pista solicitada')}>
                    Pedir Pista
                </Button>
            </Box>
        </Box>
    );
};

export default Game;