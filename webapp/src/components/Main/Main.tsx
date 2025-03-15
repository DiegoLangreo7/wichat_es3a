import {Box, Button} from '@mui/material';
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";

const Main = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate("/game"); // Redirige a la ruta /game
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
                <Button onClick={handleButtonClick} sx={{backgroundColor: '#2F353B', color: 'white', padding: 2}}>Jugar</Button>
            </Box>
        </Box>

    );
};

export default Main;
