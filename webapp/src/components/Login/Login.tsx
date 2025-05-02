import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Typography, TextField, Button, Link, Box, Paper } from '@mui/material';
import { ErrorResponse } from '../ErrorInterface';
import { useNavigate } from 'react-router';
import RetroRain from '../Animation/RetroRain';
import '../styles.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({ username: '', password: '', general: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    const validateFields = () => {
        let valid = true;
        const newErrors = { username: '', password: '', general: '' };

        if (!username.trim()) {
            newErrors.username = 'Nombre de usuario obligatorio.';
            valid = false;
        }
        if (!password.trim()) {
            newErrors.password = 'Contraseña obligatoria.';
            valid = false;
        }

        setError(newErrors);
        return valid;
    };

    const loginUser = async () => {
        if (!validateFields()) return;
        try {
            setLoading(true);
            const response = await axios.post(`${apiEndpoint}/login`, { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', JSON.stringify(response.data.username));
            navigate('/main');
        } catch (errors) {
            const error = errors as AxiosError<ErrorResponse>;
            const newErrors = { username: '', password: '', general: '' };

            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data.error;

                if (status === 400) {
                    newErrors.general = Array.isArray(errorData)
                        ? errorData.map((e) => e.msg).join(' ')
                        : errorData || 'Error desconocido';
                } else if (status === 401) {
                    newErrors.general = 'Usuario o contraseña incorrectos';
                } else {
                    newErrors.general = 'Error desconocido en el servidor';
                }
            } else if (error.request) {
                newErrors.general = 'No se recibió respuesta del servidor';
            } else {
                newErrors.general = 'Error al enviar la solicitud';
            }

            setError(newErrors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            id="login-component"
            component="main"
            sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#0a0a1f',
                width: '100%',
                height: '100vh',
                overflow: 'hidden'
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    loginUser();
                }
            }}
        >
            <RetroRain />

            <Paper
                id="login-paper"
                elevation={3}
                sx={{
                    zIndex: 1,
                    padding: '20px',
                    textAlign: 'center',
                    width: '40%',
                    borderRadius: '10px',
                    backgroundColor: '#5f4bb6'
                }}
            >
                <Typography component="h1" variant="h5" gutterBottom sx={{ color: '#F7FFF7' }}>
                    Welcome to WICHAT
                </Typography>

                <form autoComplete="on">
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        error={!!error.username}
                        helperText={error.username}
                        autoComplete="username"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#EDC9FF' }
                            },
                            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                borderColor: '#EDC9FF'
                            },
                            '& .MuiInputLabel-root': {
                                color: '#F7FFF7'
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#F7FFF7'
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error.password}
                        helperText={error.password}
                        autoComplete="current-password"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#EDC9FF' }
                            },
                            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                borderColor: '#EDC9FF'
                            },
                            '& .MuiInputLabel-root': {
                                color: '#F7FFF7'
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#F7FFF7'
                            }
                        }}
                    />
                </form>

                {error.general && (
                    <Typography id="login-error" sx={{ mt: 1, color: '#F7B801' }}>
                        {error.general}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={loginUser}
                        disabled={loading}
                        sx={{
                            width: '40%',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'scale(1.05)' },
                            '&:active': { transform: 'scale(0.95)' },
                            backgroundColor: '#F7B801',
                            color: '#202A25'
                        }}
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </Button>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate('/register')}
                        sx={{ mt: 2, display: 'block', color: '#EDC9FF' }}
                    >
                        Don't have an account? Sign up here.
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;