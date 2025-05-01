import React, {useEffect, useRef, useState} from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

interface LLMChatProps {
  question: string;
  solution: string;
  options: string[];
  onClueUsed: () => void; // Nuevo prop para notificar que se usó una pista
}

const LLMChat: React.FC<LLMChatProps> = ({ question, solution, options, onClueUsed }) => {
  const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'system' }[]>([
    { text: "Pregunta una pista a su IA de confianza a cambio del 50% de su puntuación", sender: 'system' }
  ]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clueUsed, setClueUsed] = useState<boolean>(false); // Para rastrear si ya se usó una pista

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      const userMessage = newMessage.trim();
      setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
      setNewMessage(""); // Limpiar el input inmediatamente
      setIsLoading(true);
      
      if (!clueUsed) {
        setClueUsed(true);
        onClueUsed(); // Envia el aviso a game para multar la puntuación
      }
      
      try {
        // Uso del endpoint game-hint
        const response = await axios.post(`${apiEndpoint}/game-hint`, {
          question: question,
          solution: solution,
          options: options,
          userMessage: userMessage
        });
        
        if (response.data && response.data.answer) {
          setMessages(prev => [...prev, { text: response.data.answer, sender: 'system' }]);
        } else {
          setMessages(prev => [...prev, { 
            text: "Lo siento, no pude generar una pista en este momento.", 
            sender: 'system' 
          }]);
        }
      } catch (error) {
        console.error("Error al obtener pista:", error);
        setMessages(prev => [...prev, { 
          text: "Ocurrió un error al procesar tu solicitud. Inténtalo nuevamente.", 
          sender: 'system' 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Manejar envío al presionar Enter ;D
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null); // Especifica el tipo como HTMLDivElement

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <Box id="llm-chat-container"
             sx={{
                 width: '100%',
                 display: 'flex',
                 flexDirection: 'column',
                 bgcolor: '#202A25',
                 borderRadius: 2,
                 boxShadow: 3,
                 margin: 1,
                 height: 'calc(100% - 16px)', // Altura completa menos márgenes
                 minHeight: 0, // Importante para flexbox en algunos navegadores
             }}
        >
            {/* Contenedor de mensajes con scroll */}
            <Box id="chat-messages-container"
                 sx={{
                     flex: 1, // Ocupa el espacio disponible
                     overflowY: 'auto', // Habilita scroll vertical
                     px: 1, // Padding horizontal
                     py: 1, // Padding vertical
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 1, // Espacio entre mensajes
                     // Estilos personalizados para la barra de scroll
                     '&::-webkit-scrollbar': {
                         width: '6px',
                     },
                     '&::-webkit-scrollbar-track': {
                         background: '#2E3A34',
                         borderRadius: '3px',
                     },
                     '&::-webkit-scrollbar-thumb': {
                         background: '#5f4bb6',
                         borderRadius: '3px',
                     },
                 }}
            >
                {/* Mensajes */}
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                        }}
                    >
                        <Typography
                            sx={{
                                bgcolor: message.sender === 'user' ? '#5f4bb6' : '#F7FFF7',
                                color: message.sender === 'user' ? '#F7FFF7' : '#202A25',
                                p: 1.5,
                                borderRadius: 2,
                                wordBreak: 'break-word',
                            }}
                        >
                            {message.text}
                        </Typography>
                    </Box>
                ))}

                {/* Indicador de carga */}
                {isLoading && (
                    <Box sx={{ alignSelf: 'flex-start' }}>
                        <Typography
                            sx={{
                                bgcolor: 'grey.200',
                                color: 'black',
                                p: 1.5,
                                borderRadius: 2,
                            }}
                        >
                            Pensando...
                        </Typography>
                    </Box>
                )}

                {/* Elemento invisible para scroll automático */}
                <div ref={messagesEndRef} />
            </Box>

            {/* Área de entrada */}
            <Box id="chat-input-container"
                 sx={{
                     display: 'flex',
                     p: 1,
                     gap: 1,
                 }}
            >
                <TextField
                    fullWidth
                    placeholder="Escribe tu mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    sx={{
                        '& .MuiInputBase-input': {
                            color: '#F7FFF7',
                        },
                        '& .MuiInputLabel-root': {
                            color: '#F7FFF7',
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#F7FFF7',
                            },
                            '&:hover fieldset': {
                                borderColor: '#F7FFF7',
                            },
                        },
                    }}
                    variant="outlined"
                    size="small"
                />
                <IconButton
                    id="send-message-button"
                    onClick={handleSendMessage}
                    disabled={isLoading || newMessage.trim() === ''}
                    sx={{ color: '#F7B801' }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default LLMChat;