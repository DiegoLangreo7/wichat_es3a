import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Container, Typography, TextField, Button, Link, Box } from '@mui/material';
import { ErrorResponse } from '../ErrorInterface';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState({ username: '', password: '', general: '' });
  const [loading, setLoading] = useState(false);
  const newSessionId = uuidv4();
  

  const navigate = useNavigate();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const validateFields = () => {
    let valid = true;
    const newErrors = { username: '', password: '', general: '' };

    if (!username) {
      newErrors.username = 'Username is required.';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required.';
      valid = false;
    }

    setError(newErrors);
    return valid;
  };

  const loginUser = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setError({ username: '', password: '', general: '' });

    try {
        localStorage.setItem('sessionId', newSessionId);
        localStorage.setItem('username', username);
        navigate('/main'); 
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;

        localStorage.removeItem("user");

        setError((prev) => ({
            ...prev,
            general: axiosError.response?.data?.error || 'An unknown error occurred.',
        }));
    } finally {
        setLoading(false);
    }
  };


  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 6, textAlign: 'center' }}>
      <Typography component="h1" variant="h5" gutterBottom>
        Welcome to WICHAT
      </Typography>
      <Box sx={{ mt: 2 }}>
        <TextField
          margin="normal"
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={!!error.username}
          helperText={error.username}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error.password}
          helperText={error.password}
        />
        {error.general && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error.general}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={loginUser} 
            disabled={loading} 
            sx={{ width: '100%', transition: 'transform 0.2s ease-in-out',
                  '&:hover': { transform: 'scale(1.05)' },
                  '&:active': { transform: 'scale(0.95)' } }}>
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </Box>
      </Box>
      {message && (
        <Typography color="primary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
      <Link component="button" variant="body2" onClick={() => navigate('/register')} sx={{ mt: 2, display: 'block' }}>
        Don't have an account? Sign up here.
      </Link>
    </Container>
  );
};

export default Login;