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
            newErrors.password = 'Contraseña obligatoria'; //NOSONAR
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
                        // Estilo normal (sin error)
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#EDC9FF', // Borde normal
                            },
                            '&:hover fieldset': {
                                borderColor: '#EDC9FF', // Borde al pasar el mouse
                            },
                        },
                        // Estilo cuando está enfocado (sin error)
                        '& .MuiOutlinedInput-root.Mui-focused': {
                            '& fieldset': {
                                borderColor: '#EDC9FF', // Borde en focus
                            },
                        },
                        // Estilo cuando hay error (sobrescribe los estilos anteriores)
                        '& .MuiOutlinedInput-root.Mui-error': {
                            '& fieldset': {
                                borderColor: '#F7B801', // Borde en error
                            },
                            '&:hover fieldset': {
                                borderColor: '#F7B801', // Borde en error + hover
                            },
                        },
                        // Estilo del label normal
                        '& .MuiInputLabel-root': {
                            color: '#F7FFF7', // Label normal
                        },
                        // Label en focus (sin error)
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#F7FFF7',
                        },
                        // Label cuando hay error
                        '& .MuiInputLabel-root.Mui-error': {
                            color: '#F7B801', // Label en error
                        },
                        // Helper text (mensaje de error)
                        '& .MuiFormHelperText-root': {
                            '&.Mui-error': {
                                color: '#F7B801', // Texto de error en morado oscuro
                            },
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
                            // Estilo normal (sin error)
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#EDC9FF', // Borde normal
                                },
                                '&:hover fieldset': {
                                    borderColor: '#EDC9FF', // Borde al pasar el mouse
                                },
                            },
                            // Estilo cuando está enfocado (sin error)
                            '& .MuiOutlinedInput-root.Mui-focused': {
                                '& fieldset': {
                                    borderColor: '#EDC9FF', // Borde en focus
                                },
                            },
                            // Estilo cuando hay error (sobrescribe los estilos anteriores)
                            '& .MuiOutlinedInput-root.Mui-error': {
                                '& fieldset': {
                                    borderColor: '#F7B801', // Borde en error
                                },
                                '&:hover fieldset': {
                                    borderColor: '#F7B801', // Borde en error + hover
                                },
                            },
                            // Estilo del label normal
                            '& .MuiInputLabel-root': {
                                color: '#F7FFF7', // Label normal
                            },
                            // Label en focus (sin error)
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#F7FFF7',
                            },
                            // Label cuando hay error
                            '& .MuiInputLabel-root.Mui-error': {
                                color: '#F7B801', // Label en error
                            },
                            // Helper text (mensaje de error)
                            '& .MuiFormHelperText-root': {
                                '&.Mui-error': {
                                    color: '#F7B801', // Texto de error en morado oscuro
                                },
                            },
                        }}
                    />
                    {error.general && (
                        <Typography id="error-message" sx={{ mt: 1 , color: '#F7B801'}}>
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
