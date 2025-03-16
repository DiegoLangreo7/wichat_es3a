import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Grid, Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface QuestionProps {
    totalQuestions: number;
    themes: { [key: string]: boolean };
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    imageUrl?: string;
}

const Question: React.FC<QuestionProps> = ({ totalQuestions, themes }) => {
    const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;

    const [questions, setQuestions] = useState<Question[]>([]);  // Guardar todas las preguntas
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);  // Índice de la pregunta actual
    const [respuestasAleatorias, setRespuestasAleatorias] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [correctQuestions, setCorrectQuestions] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [timer, setTimer] = useState<number>(0);
    const [themesSelected, setThemesSelected] = useState<{ [key: string]: boolean }>({
        "country": true,
    });
    const [numberClics, setNumberClics] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');  // Respuesta seleccionada
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const location = useLocation();

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

    // Función para obtener las preguntas de la API
    const obtenerPreguntas = async (): Promise<void> => {
        setIsLoading(true)
        try {
            const temas = Object.entries(themesSelected)
                .filter(([tema, seleccionado]) => seleccionado)
                .map(([tema]) => tema);
            const randomIndex = getRandomInt(temas.length);
            const temaAleatorio = temas[randomIndex];
            console.log('temaAleatorio', temaAleatorio);
            const response = await axios.get(`${apiEndpoint}/questions/${temaAleatorio}`);
            console.log('response', response.data);
            setQuestions(prevQuestions => [...prevQuestions, response.data]);
        } catch (err: any) {
            console.log("Error al obtener las preguntas", err);
            setError('Error al obtener las preguntas');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para actualizar las respuestas aleatorias
    const actualizarRespuestas = () => {
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
            const respuestas: string[] = [...questions[currentQuestionIndex].options];
            setRespuestasAleatorias(respuestas.sort(randomSort).slice(0, 4)); // Mostrar solo 4 respuestas
        }
    };

    const actualizarImagen = () => {
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
            const imageUrl = questions[currentQuestionIndex].imageUrl;
            setImageUrl(imageUrl || '');
        }
    }

    useEffect(() => {
        console.log("Ejecutando useEffect...");  // <-- Verifica que esto se imprima
        obtenerPreguntas();
    }, []); // Este efecto solo se ejecutará una vez al principio

    // Esta función se asegura de que se actualicen las respuestas cada vez que cambie la pregunta
    useEffect(() => {
        actualizarRespuestas();  // Actualiza las respuestas cuando cambia la pregunta
        actualizarImagen();
    }, [questions]); // Se ejecuta cuando el índice de la pregunta cambia

    // Función para manejar la respuesta seleccionada
    const handleButtonClick = async (respuestaSeleccionada: string, index: number): Promise<void> => {
        if (!finished) {
            if (selectedOption !== null) return; // Si ya se seleccionó una opción, no hacer nada

            setSelectedOption(index); // Guardar la opción seleccionada actualmente

            if (respuestaSeleccionada === questions[currentQuestionIndex].correctAnswer) {
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

                // Avanzar a la siguiente pregunta
                if (currentQuestionIndex < totalQuestionsFixed - 1) {
                    obtenerPreguntas();
                    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                } else {
                    setFinished(true);  // Si ya se completaron todas las preguntas, terminar el juego
                }
            }, delayBeforeNextQuestion);
        }
    };

    return (
        <Container maxWidth="lg">
            {error && <Typography color="error">{error}</Typography>}
    
            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress color="primary" />
                    <Typography variant="h5" sx={{ ml: 2 }}>Cargando preguntas...</Typography>
                </Box>
            ) : (
                questions.length > 0 && (
                    <>
                        <Box display="flex" justifyContent="center" mb={2}>
                            <img 
                                src={imageUrl} 
                                alt="Imagen país" 
                                style={{ 
                                    width: '40%',        
                                    aspectRatio: '3/2',  
                                    borderRadius: '8px', 
                                    objectFit: 'cover',   
                                }} 
                                loading="lazy"
                            />
                        </Box>
                        {questions.length > 0 && questions[currentQuestionIndex] && (
                            <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
                                {questions[currentQuestionIndex].question}
                            </Typography>
                        )}
    
                        <Grid container spacing={2} justifyContent="center">
                            {respuestasAleatorias.map((respuesta, index) => (
                                <Grid item xs={6} key={index}>
                                    <Button
                                        variant="contained"
                                        color={
                                            selectedOption !== null
                                                ? respuesta === questions[currentQuestionIndex].correctAnswer
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
                    </>
                )
            )}
        </Container>
    );
};
export default Question;

