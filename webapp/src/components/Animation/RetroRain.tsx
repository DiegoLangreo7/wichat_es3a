import React from 'react';
import { Typography, Box } from '@mui/material';
import '../styles.css';

const RetroRain = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = localStorage.getItem('showAnimation') !== 'false';

    if (prefersReducedMotion || !show) return null;

    return (
        <Box id="background-animation">
            {Array.from({ length: 100 }, (_, i) => {
                const symbols = ['👾', '▓', '█', '░', '▄', '★', '◆'];
                const char = symbols[Math.floor(Math.random() * symbols.length)];
                const colors = ['#39FF14', '#FF00FF', '#00FFFF', '#FFB6C1', '#FFD700'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = `${Math.random() * 100}%`;
                const delay = `${Math.random() * 10}s`;
                const duration = `${6 + Math.random() * 5}s`;
                const size = `${18 + Math.random() * 12}px`;

                return (
                    <Typography
                        key={i}
                        className="pixel-drop"
                        sx={{
                            left,
                            animationDelay: delay,
                            animationDuration: duration,
                            color,
                            fontSize: size
                        }}
                    >
                        {char}
                    </Typography>
                );
            })}
        </Box>
    );
};

export default React.memo(RetroRain);