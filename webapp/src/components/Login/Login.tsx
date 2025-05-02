import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Typography, TextField, Button, Link, Box, Paper } from '@mui/material';
import { ErrorResponse } from '../ErrorInterface';
import { useNavigate } from 'react-router';
import '../styles.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<{ username: string; password: string; general: string }>({ username: '', password: '', general: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

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
        try {
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

    const invaders = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 20}s`
    }));

    return (
        <Box
            id="login-component"
            component="main"
            sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#202A25',
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            {/* Fondo animado de marcianitos 👾 */}
            <Box id="background-animation">
                {invaders.map(inv => (
                    <Typography
                        key={inv.id}
                        className="invader"
                        sx={{
                            left: inv.left,
                            top: '-30px',
                            position: 'absolute',
                            animationDelay: inv.delay,
                        }}
                    >
                        👾
                    </Typography>
                ))}
            </Box>

            {/* Login principal */}
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
                <Typography id="login-title" component="h1" variant="h5" gutterBottom sx={{ color: '#F7FFF7' }}>
                    Welcome to WICHAT
                </Typography>
                <form
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            loginUser();
                        }
                    }}
                    autoComplete="on"
                >
                    <TextField
                        id="login-username-field"
                        name="username"
                        margin="normal"
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        error={!!error.username}
                        helperText={error.username}
                        autoComplete="username"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#EDC9FF',
                                },
                            },
                            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                borderColor: '#EDC9FF',
                            },
                            '& .MuiInputLabel-root': {
                                color: '#F7FFF7',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#F7FFF7',
                            },
                        }}
                    />
                    <TextField
                        id="login-pwd-field"
                        name="password"
                        margin="normal"
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error.password}
                        helperText={error.password}
                        autoComplete="current-password"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#EDC9FF',
                                },
                            },
                            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                borderColor: '#EDC9FF',
                            },
                            '& .MuiInputLabel-root': {
                                color: '#F7FFF7',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#F7FFF7',
                            },
                        }}
                    />
                </form>
                {error.general && (
                    <Typography id="login-error" color="error" sx={{ mt: 1 }}>
                        {error.general}
                    </Typography>
                )}
                <Box
                    id="login-actions-container"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        mt: 2
                    }}
                >
                    <Button
                        id="login-button"
                        variant="contained"
                        color="primary"
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
                        id="singup-link"
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