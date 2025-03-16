import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Grid, Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface QuestionProps {
    totalQuestions: number;
    themes: { [key: string]: boolean };
    onAnswer: (isCorrect: boolean) => void; // Cambiar a onAnswer
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    imageUrl?: string;
}

const Question: React.FC<QuestionProps> = ({ totalQuestions, themes, onAnswer }) => {

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [respuestasAleatorias, setRespuestasAleatorias] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [themesSelected, setThemesSelected] = useState<{ [key: string]: boolean }>({
        "country": true,
    });
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const location = useLocation();

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
        console.log("Ejecutando useEffect...");
        obtenerPreguntas();
    }, []);

    useEffect(() => {
        actualizarRespuestas();
        actualizarImagen();
    }, [questions]);

    const handleButtonClick = async (respuestaSeleccionada: string, index: number): Promise<void> => {
        if (selectedOption !== null) return;

        setSelectedOption(index);

        const isCorrect = respuestaSeleccionada === questions[currentQuestionIndex].correctAnswer;
        setSelectedAnswer(isCorrect ? 'correct' : 'incorrect');
        onAnswer(isCorrect);

        setTimeout(() => {
            setSelectedOption(null);
            setSelectedAnswer('');
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }, delayBeforeNextQuestion);
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