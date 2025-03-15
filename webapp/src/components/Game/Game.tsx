//La totalidad de este codigo esta sacado del siguiente repositorio:
//https://github.com/Arquisoft/wiq_es6b/blob/master/webapp/src/components/Game.js
//Creditos al equipo correspondiente en su totalidad
//Este codigo ha sido modificado para adaptarse a los requerimientos del proyecto
//Eso incluye su traducción a TypeScript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Container, Typography, Button, Snackbar, Grid, List, ListItem, ListItemText, Box} from '@mui/material';
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

    const [correctQuestions, setCorrectQuestions] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [numberClics, setNumberClics] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [almacenado, setAlmacenado] = useState<boolean>(false);

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
    }, [timeLimitFixed, timer, finished]);

    const handleTimeRemaining = (): string => {
        const remaining = timeLimitFixed - timer;
        const minsR = Math.floor(remaining / 60);
        const minsRStr = minsR < 10 ? '0' + minsR.toString() : minsR.toString();
        const secsR = remaining % 60;
        const secsRStr = secsR < 10 ? '0' + secsR.toString() : secsR.toString();
        return `${minsRStr}:${secsRStr}`;
    };

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

            <Box sx={{
                width: '100%',
                margin: 4,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Question totalQuestions={totalQuestions} themes={themes} />

                <Typography
                    component="h2"
                    sx={{
                        textAlign: 'center',
                        color: (timeLimitFixed - timer) <= 60 && timer % 2 === 0 ? 'red' : 'inherit',
                        fontStyle: 'italic',
                        fontWeight: timer > 150 && timer % 2 === 0 ? 'bold' : 'inherit',
                    }}
                >
                    {handleTimeRemaining()}
                </Typography>
            </Box>


            <Box sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
            }}>
                <Button
                    sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        '&:hover': {
                            backgroundColor: 'darkblue',
                        },
                    }}
                >
                    LLM
                </Button>
            </Box>
        </Box>

    );
};

export default Game;
