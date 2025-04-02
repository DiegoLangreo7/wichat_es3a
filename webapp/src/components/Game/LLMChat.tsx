import React, {useState} from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';



interface LLMChatProps {
  question: string;
  solution: string;
}


const LLMChat: React.FC<LLMChatProps> = ({ question, solution }) => {

  const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'system' }[]>([
    { text: "Pregunta una pista a su IA de confianza a cambio del 50% de su puntuación", sender: 'system' }
  ]);
  const [newMessage, setNewMessage] = useState<string>("");

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      setMessages(prev => [...prev, { text: newMessage, sender: 'user' }]);
      console.log("Mensaje enviado:", newMessage);
      try {
        const response = await axios.post(`${apiEndpoint}/askllm`, {
          solution: solution,
          question: question,
          message: newMessage,
          language: "español"
        });
        setMessages(prev => [...prev, { text: response.data, sender: 'system' }]);
        setNewMessage(""); // Limpiar el input después de enviar
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        mt: 3,
        maxHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        p: 2,
        width: '100%',
        margin: 2
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                bgcolor: message.sender === 'user' ? 'blue.200' : 'gray.300',
                color: 'black',
                p: 1,
                borderRadius: 1,
              }}
            >
              {message.text}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex">
        <TextField
          fullWidth
          placeholder="Escribe tu mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <IconButton color="primary" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default LLMChat;