import React, { useState } from 'react';
import axios, {AxiosError} from 'axios';
import {Container, Box, Button} from '@mui/material';
import {ErrorResponse} from '../ErrorInterface';
import { useNavigate } from 'react-router-dom';
import NavBar from "./items/NavBar";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const Main = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const navigate = useNavigate();

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Box component="main" sx={{
            margin: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Box sx={{ width: '100%' }}>
                <NavBar />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: 10}}>
                <Button sx={{backgroundColor: '#2F353B', color: 'white', padding: 2}}>Jugar</Button>
            </Box>
        </Box>

    );
};

export default Main;
