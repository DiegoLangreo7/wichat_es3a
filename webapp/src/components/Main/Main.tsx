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
        <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
            <Box>
            <NavBar></NavBar>
            </Box>
        </Container>
    );
};

export default Main;
