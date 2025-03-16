import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Box, CircularProgress } from '@mui/material';

interface QuestionProps {
    question: Question | null;
    onAnswer: (isCorrect: boolean) => void;
    isTransitioning: boolean;
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    imageUrl?: string;
}

const Question: React.FC<QuestionProps> = ({ question, onAnswer, isTransitioning }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    const handleButtonClick = (respuestaSeleccionada: string, index: number): void => {
        if (selectedOption !== null || isTransitioning) return;

        setSelectedOption(index);

        const isCorrect = respuestaSeleccionada === question?.correctAnswer;
        setSelectedAnswer(isCorrect ? 'correct' : 'incorrect');
        onAnswer(isCorrect);
    };

    useEffect(() => {
        setSelectedOption(null);
        setSelectedAnswer('');
    }, [question]);

    if (!question) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="center" mb={2}>
                {question.imageUrl && (
                    <img 
                        src={question.imageUrl} 
                        alt="Imagen" 
                        style={{ 
                            width: '40%',        
                            aspectRatio: '3/2',  
                            borderRadius: '8px', 
                            objectFit: 'cover',   
                        }} 
                        loading="lazy"
                    />
                )}
            </Box>
            <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
                {question.question}
            </Typography>
            <Grid container spacing={2} justifyContent="center">
                {question.options.map((respuesta, index) => (
                    <Grid item xs={6} key={index}>
                        <Button
                            variant="contained"
                            color={
                                selectedOption !== null
                                    ? respuesta === question.correctAnswer
                                        ? 'success'
                                        : index === selectedOption
                                            ? 'error'
                                            : 'primary'
                                    : 'primary'
                            }
                            onClick={() => handleButtonClick(respuesta, index)}
                            disabled={isTransitioning}
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