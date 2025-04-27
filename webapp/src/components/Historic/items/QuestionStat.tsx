import React, {useEffect} from "react";
import {Box, Card, CardContent, Chip, Divider, Paper, Typography} from "@mui/material";
import axios from "axios";

interface QuestionStatProps {
    question: Question;
}

interface Question {
    options: [string],
    correctAnswer: string,
    answer: string,
    category: string,
    imageUrl: string,
    user: string,
    time: number
}

const QuestionStat: React.FC<QuestionStatProps> = ({ question }) => {
    const isCorrect = question.correctAnswer === question.answer;
    const preloadImage = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => reject();
        });
    };

    useEffect(() => {
        // Función para obtener usuarios
        const fetchImage = async () => {
            if (question! && question.imageUrl){
                await preloadImage(question.imageUrl);
            }
        };
        fetchImage();}, []);

    return (
        <Card
            variant="outlined"
            sx={{
                transition: 'transform 0.2s',
                bgcolor: '#F7B801',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                }
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#202A25'}}>
                    <strong>Pregunta</strong>
                </Typography>
                <Box id="question-image-container" display="flex" justifyContent="center" sx={{ mb: 2}}>
                    {question.imageUrl && (
                        <img  id="question-image"
                              src={question.imageUrl}
                              alt="Imagen"
                              style={{
                                  width: '500px',
                                  aspectRatio: '3/2',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                              }}
                              loading="lazy"
                        />
                    )}
                </Box>
                {question.category && (
                    <Chip
                        label={question.category}
                        size="small"
                        sx={{
                            mb: 2,
                            bgcolor: '#EDC9FF',
                            border: '2px solid #202A25', // Borde sólido del color deseado
                        }}
                    />
                )}

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" gutterBottom sx={{ color: '#F7FFF7'}}>
                    <strong>Opciones:</strong>
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {question.options && question.options.map((option: string, i: number) => (
                        <Chip
                            key={i}
                            label={option}
                            variant={option === question.correctAnswer ? "filled" : "outlined"}
                            color={option === question.correctAnswer ? "success" : "default"}
                            sx ={{ borderColor: "#202A25"}}
                        />
                    ))}
                </Box>

            </CardContent>
        </Card>
    );
};

export default QuestionStat;