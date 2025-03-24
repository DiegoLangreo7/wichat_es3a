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
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    imageUrl?: string;
}

const Game: React.FC<GameProps> = ({ username, totalQuestions, timeLimit, themes }) => {
    // Si las props numéricas no son válidas se asignan valores por defecto
    const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;
    const timeLimitFixed = isNaN(timeLimit) || timeLimit <= 0 ? 180 : timeLimit;
    const TOTAL_ROUNDS = totalQuestionsFixed;
    const TRANSITION_ROUND_TIME = 3; // 3 segundos de pausa antes de la siguiente ronda
    const BASE_SCORE = 100; // Puntuación base para cada pregunta

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
    const [timer, setTimer] = useState<number>(timeLimitFixed); // Inicializar con el tiempo límite
    const [numberClics, setNumberClics] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [almacenado, setAlmacenado] = useState<boolean>(false);
    const [score, setScore] = useState(0); // Puntuación total
    const [totalTimePlayed, setTotalTimePlayed] = useState(0); // Tiempo total jugado
    const [correctAnswers, setCorrectAnswers] = useState(0); // Número de preguntas acertadas
    const [round, setRound] = useState(1);
    const [isPaused, setIsPaused] = useState<boolean>(false); // Nuevo estado para pausar el temporizador
    const [transitionTimer, setTransitionTimer] = useState<number>(0); // Estado para manejar el tiempo de transición
    const [isVisible, setIsVisible] = useState<boolean>(true); // Estado para manejar la visibilidad del tiempo
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null); // Estado para la pregunta actual
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    const fetchQuestion = async () => {
        try {
            const response = await axios.get(`${apiEndpoint}/questions/country`);
            setCurrentQuestion(response.data);
            setIsLoading(false); // Actualizar el estado a false cuando se carguen las preguntas
        } catch (error) {
            console.error("Error fetching question:", error);
        }
    };

    const handleTimeRemaining = (): string => {
        const remaining = isPaused ? transitionTimer : timer;
        const minsR = Math.floor(remaining / 60);
        const secsR = remaining % 60;
        const secsRStr = secsR < 10 ? '0' + secsR.toString() : secsR.toString();
        return `${secsRStr}`;
    };

    const handleNextRound = () => {
        setIsTransitioning(true); // Iniciar la transición
        setTransitionTimer(TRANSITION_ROUND_TIME);
        const transitionInterval = setInterval(() => {
            setTransitionTimer(prev => {
                if (prev > 1) {
                    return prev - 1;
                } else {
                    clearInterval(transitionInterval);
                    if (round < TOTAL_ROUNDS) {
                        setRound(prevRound => prevRound + 1);
                        setTimer(timeLimitFixed); // Reiniciar el temporizador
                        setIsPaused(false); // Reanudar el temporizador
                        fetchQuestion(); // Obtener una nueva pregunta
                    } else {
                        setFinished(true);
                        navigate('/endGame', { state: { score, username, totalQuestions, timeLimit, themes, correctAnswers, totalTimePlayed } });
                    }
                    setIsTransitioning(false); // Finalizar la transición
                    return 0;
                }
            });
        }, 1000);

        // Alternar la visibilidad del tiempo cada 500 ms
        const visibilityInterval = setInterval(() => {
            setIsVisible(prev => !prev);
        }, 500);

        setTimeout(() => {
            clearInterval(visibilityInterval);
            setIsVisible(true); // Asegurarse de que el tiempo sea visible al final de la transición
        }, TRANSITION_ROUND_TIME * 1000);
    };

    const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
        setIsPaused(true); // Pausar el temporizador
        setSelectedAnswer(selectedAnswer);
        setIsCorrectAnswer(isCorrect);
        const timeTaken = timeLimitFixed - timer;
        setTotalTimePlayed(prevTime => prevTime + timeTaken);
        if (isCorrect) {
            const questionScore = BASE_SCORE - ((timeLimitFixed - timer) / timeLimitFixed) * BASE_SCORE;
            setScore(prevScore => prevScore + questionScore);
            setCorrectAnswers(prev => prev + 1);
        }
        setTimeout(() => {
            handleNextRound();
        }, 2000); // Esperar 2 segundos antes de pasar a la siguiente ronda
    };

    useEffect(() => {
        fetchQuestion(); // Obtener la primera pregunta al cargar el componente
    }, []);

    useEffect(() => {
        if (!isPaused && !isLoading) {
            const interval = setInterval(() => {
                if (timer > 0) {
                    setTimer(prevTimer => prevTimer - 1);
                } else {
                    setIsPaused(true); // Pausar el temporizador
                    handleNextRound();
                }
            }, 1000);
    
            return () => clearInterval(interval);
        }
    }, [timer, isPaused, isLoading]);

    useEffect(() => {
        if (finished && round >= TOTAL_ROUNDS) {
            navigate('/endGame', { state: { score, username, totalQuestions, timeLimit, themes, correctAnswers, totalTimePlayed } });
        }
    }, [finished, navigate, score, username, totalQuestions, timeLimit, themes, round]);

    return (
        <Box component="main" sx={{
            height: '100vh', // Ocupa toda la altura de la pantalla
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        }}>
            <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>
    
            {isLoading ? (
                <Box display="flex" alignItems="center">
                <Typography variant="h6" color="textSecondary" sx={{ mr: 2 }}>
                    Cargando...
                </Typography>
                <CircularProgress />
            </Box>
            ) : (
                <>
                    <Box display="flex" justifyContent="center" alignItems="center" position="relative" mt={10} mb={3}>
                        <CircularProgress variant="determinate" value={isPaused ? (transitionTimer / TRANSITION_ROUND_TIME) * 100 : (timer / timeLimitFixed) * 100} size={80} />
                        {isVisible && (
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
                        )}
                    </Box>
                    <Question question={currentQuestion} onAnswer={handleAnswer} isTransitioning={isTransitioning} />                    
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Button variant="contained" color="secondary" size="large" onClick={() => alert('Pista solicitada')}>
                            Pedir Pista
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default Game;