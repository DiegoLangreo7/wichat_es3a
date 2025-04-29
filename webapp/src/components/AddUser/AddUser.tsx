import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import {Container, Typography, TextField, Button, Link, Box, Paper} from '@mui/material';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({ username: '', password: '', general: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const validateFields = () => {
        let valid = true;
        const newErrors = { username: '', password: '', general: '' };

        if (!username.trim()) {
            newErrors.username = 'Nombre de usuario obligatorio.';
            valid = false;
        }
        if (!password.trim()) {
            newErrors.password = 'Contraseña obligatoria';
            valid = false;
        }

        setError(newErrors);
        return valid;
    };

    const addUser = async () => {
        if (!validateFields()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${apiEndpoint}/adduser`, { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', JSON.stringify(response.data.username));
            
            navigate('/main');  // Redirigir a la página principal tras registro exitoso
							  
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            if (axiosError.response?.status == 400) {
                setError({ username: '', password: '', general: axiosError.response.data.error });
            }
													  
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box id="add-user-main-container" component="main" sx={{display: 'flex', justifyContent: 'center', backgroundColor: '#202A25', width: '100%' , height: '100vh' }}>
            <Paper id="add-user-paper" elevation={3} sx={{
                m: 20,
                padding: "20px",
                textAlign: "center",
                width: "40%",
                borderRadius: "10px",
                backgroundColor: "#5f4bb6"
            }}>
                <Typography id="add-user-title" component="h1" variant="h5" gutterBottom sx={{ color: '#F7FFF7'}}>
                    Create an account
                </Typography>
                    <TextField
                        id="username-input"
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
                        id="password-input"
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
                        <Typography id="error-message" color="error" sx={{ mt: 1 }}>
                            {error.general.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </Typography>
                    )}

                <Box id="action-buttons-container" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end', // Alinea items a la derecha
                    mt: 2
                }}>
                    <Button
                        id="submit-button"
                        variant="contained"
                        color="primary"
                        onClick={addUser}
                        disabled={loading}
                        sx={{ width: '40%', transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'scale(1.05)' },
                            '&:active': { transform: 'scale(0.95)' }, backgroundColor: '#F7B801', color: '#202A25' }}>
                        {loading ? 'Loading...' : 'Add User'}
                    </Button>
                    <Link id="login-link" component="button" variant="body2" onClick={() => navigate('/login')} sx={{ mt: 2, display: 'block', color: '#EDC9FF' }}>
                        Already have an account? Login here.
                        </Link>
                </Box>

            </Paper>

        </Box>
    );
};

export default AddUser;
