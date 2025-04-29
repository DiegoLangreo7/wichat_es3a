import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import EndGame from './EndGame';
import MockAdapter from "axios-mock-adapter";
import axios from 'axios';

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

const mockLocationState = {
    username: 'TestUser',
    totalQuestions: 10,
    timeLimit: 60,
    themes: { Geography: true },
    score: 100,
    numCorrect: 7,
    roundResults: [
        { round: 1, correct: true, timeTaken: 10, roundScore: 20 },
        { round: 2, correct: false, timeTaken: 15, roundScore: 0, usedClue: true },
    ],
    gameMode: 'Classic',
};

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState })
}));

const renderEndGameComponent = async () => {
    await act(async () => {
        render(
            <MemoryRouter>
                <EndGame />
            </MemoryRouter>
        );
    });
};

describe('EndGame Component', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
        mockAxios.onPost('http://localhost:8000/stats').reply(200, { success: true });
        localStorage.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component correctly', async () => {
        await renderEndGameComponent();

        expect(screen.getByText(/Juego Terminado!/i)).toBeInTheDocument();
        expect(screen.getByText(/TestUser, tu puntuación final es de: 100 puntos./i)).toBeInTheDocument();
        expect(screen.getByText("Respuestas correctas: 7 / 10")).toBeInTheDocument();

        expect(screen.getByText(/Ronda 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Acertada/i)).toBeInTheDocument();

        expect(screen.getByText(/Ronda 2/i)).toBeInTheDocument();
        expect(screen.getByText(/Fallada/i)).toBeInTheDocument();
    });

    it('should navigate to the game page when "Play Again" is clicked', async () => {
        await renderEndGameComponent();

        fireEvent.click(screen.getByText(/Volver a Jugar/i));
        expect(mockNavigate).toHaveBeenCalledWith('/game', {
            state: {
                username: 'TestUser',
                totalQuestions: 10,
                timeLimit: 60,
                themes: { Geography: true },
                gameMode: 'Classic',
            },
        });
    });

    it('should navigate to the main menu when "Back to Menu" is clicked', async () => {
        await renderEndGameComponent();

        fireEvent.click(screen.getByText(/Volver al Menú/i));
        expect(mockNavigate).toHaveBeenCalledWith('/main');
    });

    it('should handle server errors gracefully when sending stats', async () => {
        mockAxios.onPost('http://localhost:8000/stats').reply(500, { error: 'Server error' });

        await renderEndGameComponent();

        await waitFor(() => {
            expect(mockAxios.history.post.length).toBe(1); // Verifica que se intentó enviar la solicitud
        });
    });
});