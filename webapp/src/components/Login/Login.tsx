import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import {Container, Typography, TextField, Button, Link, Box, Paper} from '@mui/material';
import { ErrorResponse } from '../ErrorInterface';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import '../styles.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<{ username: string; password: string; general: string }>({ username: '', password: '', general: '' });
  const [loading, setLoading] = useState(false);
  const newSessionId = uuidv4();
  

  const navigate = useNavigate();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const validateFields = () => {
    let valid = true;
    const newErrors = { username: '', password: '', general: '' };

    if (!username) {
      newErrors.username = 'Nombre de usuario obligatorio.';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Contraseña obligatoria.';
      valid = false;
    }

    setError(newErrors);
    return valid;
  };

  const loginUser = async () => {
    try{
      if (!validateFields()) return;
      setLoading(true);
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });  
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', JSON.stringify(response.data.username));
      navigate('/main'); 
    } catch (errors) {
      const error = errors as AxiosError<ErrorResponse>;
      const newErrors = { username: '', password: '', general: '' };

      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (error.response.status === 400) {
          const errorData = error.response.data.error;
          if (Array.isArray(errorData)){
            newErrors.general = errorData.map((e) => e.msg).join(' ');
          } else{
            newErrors.general = errorData || 'Error desconocido';
          }
          setError(newErrors);
        } else if (error.response.status === 401) {
          newErrors.general = 'Usuario o contraseña incorrectos';
          setError(newErrors);
        } else {
          newErrors.general = 'Error desconocido en el servidor';
          setError(newErrors);
        }
      } else if (error.request) {
        newErrors.general = 'No se recibió respuesta del servidor';
        setError(newErrors);
      } else {
        newErrors.general = 'Error al enviar la solicitud';
        setError(newErrors);
      }
    } finally {
      setLoading(false);  
    }
};



  return (
    <Box component="main" sx={{display: 'flex', justifyContent: 'center', backgroundColor: '#202A25', width: '100%' , height: '100vh' }}>

      <Paper elevation={3} sx={{
        m: 20,
        padding: "20px",
        textAlign: "center",
        width: "40%",
        borderRadius: "10px",
        backgroundColor: "#5f4bb6"
      }}>
        <Typography component="h1" variant="h5" gutterBottom sx={{ color: '#F7FFF7'}}>
          Welcome to WICHAT
        </Typography>
        <TextField
          name="username"
          margin="normal"
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={!!error.username}
          helperText={error.username}
          sx={{
            // Estilo cuando NO está enfocado (normal)
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#EDC9FF', // Color del borde normal
              },
            },
            // Estilo cuando está enfocado
            '& .MuiOutlinedInput-root.Mui-focused': {
              '& fieldset': {
                borderColor: '#EDC9FF', // Color del borde en focus
              },
            },
            // Cambiar color de la etiqueta (label)
            '& .MuiInputLabel-root': {
              color: '#F7FFF7', // Color de la etiqueta normal
            },
            // Cambiar color de la etiqueta en focus
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#F7FFF7', // Color de la etiqueta en focus
            },
          }}
        />
        <TextField
          name="password"
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error.password}
          helperText={error.password}
          sx={{
            // Estilo cuando NO está enfocado (normal)
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#EDC9FF', // Color del borde normal
              },
            },
            // Estilo cuando está enfocado
            '& .MuiOutlinedInput-root.Mui-focused': {
              '& fieldset': {
                borderColor: '#EDC9FF', // Color del borde en focus
              },
            },
            // Cambiar color de la etiqueta (label)
            '& .MuiInputLabel-root': {
              color: '#F7FFF7', // Color de la etiqueta normal
            },
            // Cambiar color de la etiqueta en focus
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#F7FFF7', // Color de la etiqueta en focus
            },
          }}
        />
        {error.general && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error.general}
          </Typography>
        )}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end', // Alinea items a la derecha
          mt: 2
        }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={loginUser} 
            disabled={loading} 
            sx={{ width: '40%', transition: 'transform 0.2s ease-in-out',
                  '&:hover': { transform: 'scale(1.05)' },
                  '&:active': { transform: 'scale(0.95)' }, backgroundColor: '#F7B801', color: '#202A25' }}>
            {loading ? 'Loading...' : 'Login'}
          </Button>
          <Link component="button" variant="body2" onClick={() => navigate('/register')} sx={{ mt: 2, display: 'block', color: '#EDC9FF' }}>
            Don't have an account? Sign up here.
          </Link>
        </Box>

      </Paper>
      {message && (
        <Typography color="primary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}

    </Box>
  );
};

export default Login;