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
import LLMChat from './LLMChat';  // Importamos el componente LLMChat
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
  const [clueOpen, setClueOpen] = useState<boolean>(false);
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
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [guessed, setGuessed] = useState<boolean>(false);

  const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`${apiEndpoint}/questions/country`);
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setIsLoading(false);
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

    let multiplier = 1;
    if (timeLimitFixed === 20) multiplier = 1.5;
    else if (timeLimitFixed === 10) multiplier = 2;

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
        <Box display='flex' flexDirection='row' p={2} bgcolor='gray.100' borderRadius={2} boxShadow={3}>
          <Box display='flex' flexDirection='column' justifyContent="center" alignItems="center">
            <Box display="flex" justifyContent="center" alignItems="center" position="relative" mt={10} mb={3}>
              <CircularProgress
                variant="determinate"
                value={isPaused ? (transitionTimer / TRANSITION_ROUND_TIME) * 100 : (timer / timeLimitFixed) * 100}
                size={80}
              />
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
            {currentQuestion && (
              <Question question={currentQuestion} onAnswer={handleAnswer} isTransitioning={isTransitioning} />
            )}
            <Box display="flex" justifyContent="center" mt={3}>
              <Button variant="contained" color="secondary" size="large" onClick={() => setClueOpen(!clueOpen)}>
                Pedir Pista
              </Button>
            </Box>
          </Box>
          {clueOpen && (
            <LLMChat
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Game;