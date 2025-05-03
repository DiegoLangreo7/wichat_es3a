import React, {useEffect} from "react";
import {Box, Card, CardContent, Chip, Divider, Typography} from "@mui/material";

interface QuestionStatProps {
    question: Question;
}

interface Question {
    options: string[],
    correctAnswer: string,
    answer: string,
    category: string,
    imageUrl: string,
    user: string,
    time: number
}

const QuestionStat: React.FC<QuestionStatProps> = ({ question }) => {

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
        fetchImage();
        }, [question]);

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
                              data-testid="question-image"
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
                            variant="outlined"
                            sx={{
                                borderColor: "#202A25",
                                color: "#202A25",
                                backgroundColor: "transparent",
                                ...(option === question.correctAnswer && {
                                    backgroundColor: "#4CAF50",
                                    color: "#F7FFF7",
                                    borderColor: "#4CAF50"
                                }),
                                ...(option === question.answer && option !== question.correctAnswer && {
                                    backgroundColor: "#EF5350", // Rojo para error
                                    color: "#F7FFF7",
                                    borderColor: "#EF5350"
                                }),
                                ...(option === question.answer && option === question.correctAnswer && {
                                    backgroundColor: "#4CAF50", // Verde más intenso
                                    color: "#F7FFF7",
                                    borderColor: "#4CAF50",
                                    boxShadow: "0 0 0 2px rgba(76, 175, 80, 0.3)"
                                }),
                                transition: "all 0.3s ease",
                                margin: "4px",
                                fontWeight: "bold"
                            }}
                        />
                    ))}
                </Box>

            </CardContent>
        </Card>
    );
};

export default QuestionStat;