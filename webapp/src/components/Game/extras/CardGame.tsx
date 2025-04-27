import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    Box,
    CircularProgress,
    Card,
    CardMedia,
    CardActionArea,
    Grid,
    Snackbar,
    Alert
} from '@mui/material';
import NavBar from "../../Main/items/NavBar";

const CardGame: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Array<{id: number, value: string, flipped: boolean, matched: boolean}>>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    // Inicializar el juego
    useEffect(() => {
        initializeGame();
    }, []);

    // Temporizador
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isPaused && !gameComplete && !loading) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, gameComplete, loading]);

    const initializeGame = async () => {
        setLoading(true);
        const response = await axios.get(`${apiEndpoint}/cardValues`);
        const images = response.data.images;
        const cardValues = images.map();
        const shuffledCardValues = [...cardValues, ...cardValues]

        // Mezclar las cartas
        /*
        const shuffledCards = [...cardValues]
            .sort(() => Math.random() - 0.5)
            .map((value, index) => ({
                id: index,
                value,
                flipped: false,
                matched: false
            }));
        */
    
        setCards(shuffledCardValues);
        setFlippedCards([]);
        setMoves(0);
        setTimer(0);
        setGameComplete(false);
        setLoading(false);
    };

    const handleCardClick = (id: number) => {
        // No hacer nada si la carta ya está volteada o emparejada, o si ya hay 2 cartas volteadas
        if (cards[id].flipped || cards[id].matched || flippedCards.length >= 2 || isPaused) {
            return;
        }

        // Voltear la carta
        const newCards = [...cards];
        newCards[id].flipped = true;
        setCards(newCards);

        // Añadir a las cartas volteadas
        const newFlippedCards = [...flippedCards, id];
        setFlippedCards(newFlippedCards);

        // Si tenemos 2 cartas volteadas, comprobar si coinciden
        if (newFlippedCards.length === 2) {
            setMoves(prev => prev + 1);
            setIsPaused(true);

            const [firstId, secondId] = newFlippedCards;
            if (cards[firstId].value === cards[secondId].value) {
                // Coinciden
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[firstId].matched = true;
                    matchedCards[secondId].matched = true;
                    setCards(matchedCards);
                    setFlippedCards([]);
                    setIsPaused(false);

                    // Comprobar si el juego ha terminado
                    if (matchedCards.every(card => card.matched)) {
                        setGameComplete(true);
                        setShowSuccess(true);
                    }
                }, 1000);
            } else {
                // No coinciden
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[firstId].flipped = false;
                    resetCards[secondId].flipped = false;
                    setCards(resetCards);
                    setFlippedCards([]);
                    setIsPaused(false);
                }, 1500);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    return (
        <Box id="memory-container" component="main" sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: '#202A25',
        }}>
            <Box id="navbar-container" sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>

            {loading ? (
                <Box id="loading-container" display="flex" alignItems="center" flexDirection="column">
                    <Typography id="loading-text" variant="h6" color="#F7FFF7" sx={{ mb: 2 }}>
                        Preparando juego...
                    </Typography>
                    <CircularProgress id="loading-spinner" sx={{ color: '#F7B801' }} />
                </Box>
            ) : (
                <Box id="game-content-container" display='flex' flexDirection='column' p={3} sx={{
                    backgroundColor: '#5f4bb6',
                    borderRadius: 2,
                    boxShadow: 3,
                    width: '80%',
                    maxWidth: '600px'
                }}>
                    <Box id="game-header" display="flex" justifyContent="space-between" mb={3}>
                        <Typography variant="h6" sx={{ color: '#F7B801' }}>
                            Movimientos: {moves}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#F7B801' }}>
                            Tiempo: {formatTime(timer)}
                        </Typography>
                    </Box>

                    {/* Contenedor principal compacto */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '4px',
                        width: '96%',
                        maxWidth: '320px',
                        margin: '0 auto',
                        padding: '4px'
                    }}>
                        {cards.map((card) => (
                            <Box
                                key={card.id}
                                onClick={() => !card.matched && !isPaused && handleCardClick(card.id)}
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    perspective: '1000px',
                                    cursor: !card.matched && !isPaused ? 'pointer' : 'default',
                                    opacity: card.matched ? 0.7 : 1
                                }}
                            >
                                {/* Contenedor de la animación */}
                                <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute', // Añade esto
                                    transformStyle: 'preserve-3d',
                                    transition: 'transform 0.5s',
                                    transform: card.flipped
                                        ? 'rotateY(180deg) translateX(-3px)'  // Ajusta el valor (2px) según necesidad
                                        : 'rotateY(0deg) translateX(0px)',
                                    perspective: '1000px', // Añade perspectiva al contenedor padre
                                    transformOrigin: 'center', // Asegura que la rotación sea desde el centro
                                }}>
                                    {/* Parte trasera - clickeable */}
                                    <Box sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#F7B801',
                                        borderRadius: '8px',
                                        border: '2px solid #202A25',
                                        fontSize: 'clamp(24px, 8vw, 32px)',
                                        fontWeight: 'bold',
                                        userSelect: 'none'
                                    }}>
                                        ?
                                    </Box>

                                    {/* Parte frontal */}
                                    <Box sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#F7FFF7',
                                        borderRadius: '8px',
                                        border: '2px solid #5f4bb6',
                                        transform: 'rotateY(180deg)',
                                        fontSize: 'clamp(24px, 8vw, 32px)',
                                        fontWeight: 'bold',
                                        userSelect: 'none'
                                    }}>
                                        {card.value}
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Box id="game-controls" display="flex" justifyContent="center" mt={3}>
                        <Button
                            variant="contained"
                            onClick={initializeGame}
                            sx={{
                                backgroundColor: "#F7B801",
                                color: "#202A25",
                                '&:hover': {
                                    backgroundColor: "#EDC9FF",
                                }
                            }}
                        >
                            Reiniciar Juego
                        </Button>
                    </Box>
                </Box>
            )}

            <Snackbar
                open={gameComplete && showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    ¡Felicidades! Completaste el juego en {moves} movimientos y {formatTime(timer)}.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CardGame;