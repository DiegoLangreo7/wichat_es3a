import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
  IconButton
} from '@mui/material';
import cryptoRandomString from 'crypto-random-string';
// @ts-ignore
import Question from "./Question/Question";
import NavBar from "../Main/items/NavBar";
import SendIcon from '@mui/icons-material/Send';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  imageUrl?: string;
}

interface RoundResult {
  round: number;
  correct: boolean;
  timeTaken: number;
  roundScore: number;
}

const Game: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener los parámetros desde la navegación
  const {
    username = "Usuario",
    totalQuestions = 10,
    timeLimit = 180,
    themes = {}
  } = location.state || {};

  const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;
  const timeLimitFixed = isNaN(timeLimit) || timeLimit <= 0 ? 180 : timeLimit;
  const TOTAL_ROUNDS = totalQuestionsFixed;
  const TRANSITION_ROUND_TIME = 3;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clueOpen, setClueOpen] = useState<boolean>(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [timer, setTimer] = useState<number>(timeLimitFixed);
  const [finished, setFinished] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [numCorrect, setNumCorrect] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [transitionTimer, setTransitionTimer] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'system' }[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [guessed, setGuessed] = useState<boolean>(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`${apiEndpoint}/questions/country`);
      setCurrentQuestion(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  const handleTimeRemaining = (): string => {
    const remaining = isPaused ? transitionTimer : timer;
    const minsR = Math.floor(remaining / 60);
    const secsR = remaining % 60;
    let secsRStr = secsR < 10 ? '0' + secsR.toString() : secsR.toString();
    secsRStr = secsRStr !== '00' ? secsRStr : '  ';
    return `${secsRStr}`;
  };

  const handleNextRound = (answeredCorrectly: boolean) => {
    const currentTimer = timer;
    const roundTimeTaken = timeLimitFixed - currentTimer;
  
    // Definir multiplicador según el timeLimit
    let multiplier = 1;
    if (timeLimitFixed === 20) multiplier = 1.5;
    else if (timeLimitFixed === 10) multiplier = 2;
  
    // Calcular puntuación con bonus
    const baseScore = answeredCorrectly ? (currentTimer / timeLimitFixed) * 100 : 0;
    const roundScore = Math.round(baseScore * multiplier);
  
    if (answeredCorrectly) {
      setNumCorrect(prev => prev + 1);
    }
    setScore(prev => prev + roundScore);
  
    const roundNumber = roundResults.length + 1;
    const roundResult: RoundResult = {
      round: roundNumber,
      correct: answeredCorrectly,
      timeTaken: roundTimeTaken,
      roundScore: roundScore
    };
  
    console.log(`Ronda ${roundNumber}: correcto=${answeredCorrectly}, tiempo=${roundTimeTaken}, scoreBase=${Math.round(baseScore)}, bonus=${multiplier}x, final=${roundScore}`);
  
    setRoundResults(prev => [...prev, roundResult]);
    setGuessed(false);
  
    setIsTransitioning(true);
    setTransitionTimer(TRANSITION_ROUND_TIME);
  
    const transitionInterval = setInterval(() => {
      setTransitionTimer(prev => {
        if (prev > 1) return prev - 1;
        clearInterval(transitionInterval);
        if (round < TOTAL_ROUNDS) {
          setRound(prev => prev + 1);
          setTimer(timeLimitFixed);
          setIsPaused(false);
          fetchQuestion();
        } else {
          setFinished(true);
        }
        setIsTransitioning(false);
        return 0;
      });
    }, 1000);
  
    const visibilityInterval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 500);
    setTimeout(() => {
      clearInterval(visibilityInterval);
      setIsVisible(true);
    }, TRANSITION_ROUND_TIME * 1000);
  };
  

  const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
    setIsPaused(true);
    setSelectedAnswer(selectedAnswer);
    setIsCorrectAnswer(isCorrect);
    setGuessed(true);
    const answeredCorrectly = isCorrect;
    setTimeout(() => {
      handleNextRound(answeredCorrectly);
    }, 2000);
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (!isPaused && !isLoading) {
      const interval = setInterval(() => {
        if (timer > 0) {
          setTimer(prev => prev - 1);
        } else {
          setIsPaused(true);
          handleNextRound(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isPaused, isLoading]);

  useEffect(() => {
    if (finished && round >= TOTAL_ROUNDS) {
      navigate('/endGame', {
        state: {
          score,
          numCorrect,
          username,
          totalQuestions,
          timeLimit,
          themes,
          roundResults
        }
      });
    }
  }, [finished, navigate, score, numCorrect, username, totalQuestions, timeLimit, themes, roundResults]);

  const handleSendMessage = (): void => {
    if (newMessage.trim() !== "") {
      setMessages(prev => [...prev, { text: newMessage, sender: 'user' }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Esta es tu pista de ayuda.', sender: 'system' }]);
      }, 1000);
      setNewMessage("");
    }
  };

  return (
    <Box component="main" sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      backgroundColor: '#202A25',
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
        <Box display='flex' flexDirection='row' p={1} bgcolor='gray.100' borderRadius={2} boxShadow={3}  sx={{
          transform: 'scale(0.80)',
          transformOrigin: 'center',
          backgroundColor: '#5f4bb6'
        }}>
          <Box display='flex' flexDirection='column' justifyContent="center" alignItems="center" sx={{

          }}>
            <Box display="flex" justifyContent="center" alignItems="center" position="relative" mt={10} mb={3} >
              <CircularProgress
                variant="determinate"
                value={isPaused ? (transitionTimer / TRANSITION_ROUND_TIME) * 100 : (timer / timeLimitFixed) * 100}
                size={80}
                sx={{ color: '#F7B801'}}
              />
              {isVisible && (
                <Typography 
                  variant="h6" 
                  sx={{
                    position: "absolute",
                    fontWeight: "bold",
                    color: '#F7FFF7',
                  }}
                >
                  {handleTimeRemaining()}
                </Typography>
              )}
            </Box>
            <Question question={currentQuestion} onAnswer={handleAnswer} isTransitioning={isTransitioning}/>

            <Box display="flex" justifyContent="center" mt={3}>
              <Button variant="contained"  size="large" onClick={() => setClueOpen(!clueOpen)} sx = {{backgroundColor:'#EDC9FF', color: '#202A25'}}>
                Pedir Pista
              </Button>
            </Box>
          </Box>
          {clueOpen ? (
            <Box></Box>
          ) : (
              <Box sx={{
                width: '40%', // Ancho fijo para la columna de chat
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#202A25',
                borderRadius: 2,
                boxShadow: 3,
                margin: 1,
                height: 'calc(100% - 16px)', // Altura completa menos los márgenes
                minHeight: '0' // Importante para que flex funcione correctamente
              }}>
              <Box sx={{ flexGrow: 1, overflowY: 'auto'}}>
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Typography
                      sx={{
                        bgcolor: message.sender === 'user' ? 'blue.200' : 'gray.300',
                        color: '#F7FFF7',
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      {message.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box display="flex">
                <TextField
                    placeholder="Escribe tu mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{
                      m: 1,
                      '& .MuiInputBase-input': {
                        color: '#F7FFF7', // Color del texto ingresado
                      },
                      '& .MuiInputLabel-root': {
                        color: '#F7FFF7', // Color del placeholder
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#F7FFF7', // Color del borde
                        },
                        '&:hover fieldset': {
                          borderColor: '#F7FFF7', // Color del borde al hover
                        },
                      },
                    }}
                />
                <IconButton  onClick={handleSendMessage} sx = {{color: '#F7B801'}}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Game;