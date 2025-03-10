// src/components/Login.js
import React, { useState } from 'react';
import axios, {AxiosError} from 'axios';
import {Container, Typography, TextField, Button, Snackbar, Link} from '@mui/material';
import {ErrorResponse} from '../ErrorInterface';
import {useNavigate} from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const loginUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });

      const question = "Please, generate a greeting message for a student called " + username + " that is a student of the Software Architecture course in the University of Oviedo. Be nice and polite. Two to three sentences max.";
      const model = "empathy"

      if (apiKey==='None'){
        setMessage("LLM API key is not set. Cannot contact the LLM.");
      }
      else{
        const message = await axios.post(`${apiEndpoint}/askllm`, { question, model, apiKey })
        setMessage(message.data.answer);
      }
      // Extract data from the response
      const { createdAt: userCreatedAt } = response.data;

      setOpenSnackbar(true);
      navigate('/main');
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>; // Usa el tipo AxiosError con ErrorResponse
      if (axiosError.response && axiosError.response.data) {
        setError(axiosError.response.data.error); // Accede al mensaje de error
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      <Typography component="h1" variant="h5" align="center" sx={{ marginTop: 2 }}>
        Welcome to the 2025 edition of the Software Architecture course
      </Typography>
      <Typography component="div" align="center" sx={{ marginTop: 2 }}/>
      <div>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <TextField
            margin="normal"
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={loginUser}>
          Login
        </Button>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
        {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
        )}
        <Typography component="div" align="center" sx={{ marginTop: 2 }}/>
        <Link component="button" variant="body2" onClick={() => navigate('/register')}>
          Don't have an account? Sing up here.
        </Link>
      </div>
    </Container>
  );
};

export default Login;
