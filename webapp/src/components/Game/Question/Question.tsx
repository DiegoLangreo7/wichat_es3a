//La totalidad de este codigo esta sacado del siguiente repositorio:
//https://github.com/Arquisoft/wiq_es6b/blob/master/webapp/src/components/Game.js
//Creditos al equipo correspondiente en su totalidad
//Este codigo ha sido modificado para adaptarse a los requerimientos del proyecto
//Eso incluye su traducción a TypeScript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Snackbar, Grid, List, ListItem, ListItemText } from '@mui/material';


// TODO: pasar interfaces a backend, si el comportamiento se hace con otras clases, modificar front
interface QuestionProps {
    totalQuestions: number;
    themes: { [key: string]: boolean };
}

interface Question {
    questionBody: string;
    correcta: string;
    incorrectas: string[];
}

const Question: React.FC<QuestionProps> = ({totalQuestions, themes }) => {
    const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;

    const [question, setQuestion] = useState<Question>({
        questionBody: 'Hola, ¿Qué tal?',
        correcta: 'Mal',
        incorrectas: ['Bien', 'Adiós']
    });
    const [respuestasAleatorias, setRespuestasAleatorias] = useState<string[]>(['Bien', 'Adiós', 'Mal', 'He estado mejor']);
    const [error, setError] = useState<string>('');
    const [correctQuestions, setCorrectQuestions] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [themesSelected, setThemesSelected] = useState<{ [key: string]: boolean }>(themes);
    const [numberClics, setNumberClics] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [almacenado, setAlmacenado] = useState<boolean>(false);

    const pricePerQuestion = 25;
    const delayBeforeNextQuestion = 3000; // 3 segundos de retardo antes de pasar a la siguiente pregunta

    const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    function getRandomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }

    function randomSort(): number {
        const randomValue = Math.floor(Math.random() * 1000);
        return randomValue % 2 === 0 ? 1 : -1;
    }


    // Función para obtener una pregunta aleatoria
    const obtenerPreguntaAleatoria = async (): Promise<void> => {
        try {
            const temas = Object.entries(themesSelected)
                .filter(([tema, seleccionado]) => seleccionado)
                .map(([tema]) => tema);
            const randomIndex = getRandomInt(temas.length);
            const temaAleatorio = temas[randomIndex];

            const response = await axios.get(`${apiEndpoint}/getRandomQuestion${temaAleatorio}`);
            setQuestion(response.data);
            const respuestas: string[] = [...response.data.incorrectas, response.data.correcta];
            setRespuestasAleatorias(respuestas.sort(randomSort).slice(0, 4)); // Mostrar solo 4 respuestas
        } catch (err: any) {
            console.error("Error al obtener la pregunta aleatoria", err);
            setError('Error al obtener la pregunta aleatoria');
        }
    };

    useEffect(() => {
        obtenerPreguntaAleatoria();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiEndpoint, themesSelected]);



    const handleButtonClick = async (respuestaSeleccionada: string, index: number): Promise<void> => {
        if (!finished) {
            if (selectedOption !== null) return; // Si ya se seleccionó una opción, no hacer nada

            setSelectedOption(index); // Guardar la opción seleccionada actualmente

            if (respuestaSeleccionada === question.correcta) {
                setCorrectQuestions(prev => prev + 1);
                setSelectedAnswer('correct');
            } else {
                setSelectedAnswer('incorrect');
            }

            // Si ya llegamos a la última pregunta, acabamos la partida para mostrar el resultado
            if (numberClics === totalQuestionsFixed - 1) {
                setFinished(true);
            }

            // Después de 3 segundos, restablecer la selección y pasar a la siguiente pregunta
            setTimeout(async () => {
                setNumberClics(prev => prev + 1);
                setSelectedOption(null);
                setSelectedAnswer('');
            }, delayBeforeNextQuestion);
        }
    };

    return (
        <Container maxWidth="lg">
            <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
                {question.questionBody}
            </Typography>
            <Grid container spacing={2} justifyContent="center">
                {respuestasAleatorias.map((respuesta, index) => (
                    <Grid item xs={6} key={index}>
                        <Button
                            variant="contained"
                            color={
                                selectedOption !== null
                                    ? respuesta === question.correcta
                                        ? 'success'
                                        : index === selectedOption
                                            ? 'error'
                                            : 'primary'
                                    : 'primary'
                            }
                            onClick={() => handleButtonClick(respuesta, index)}
                            sx={{
                                margin: '8px',
                                textTransform: 'none',
                                width: '100%'
                            }}
                        >
                            {respuesta}
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Question;
