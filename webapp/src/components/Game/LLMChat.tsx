import React from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface LLMChatProps {
  messages: { text: string; sender: 'user' | 'system' }[];
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
}

const LLMChat: React.FC<LLMChatProps> = ({ messages, newMessage, setNewMessage, handleSendMessage }) => {
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