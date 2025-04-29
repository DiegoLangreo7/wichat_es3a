import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import Historic from './Historic';
import { MemoryRouter } from "react-router";
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe('Historic Component', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
        localStorage.setItem("token", "test-token");
        localStorage.setItem("username", JSON.stringify("testUser"));
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    const setupMocks = (statsResponse: any, historicResponse: any) => {
        mockAxios.onGet('http://localhost:8000/stats/testUser').reply(statsResponse.status, statsResponse.data);
        mockAxios.onPost('http://localhost:8000/stats').reply(200, {
            timePlayed: 0,
            gamesPlayed: 0,
            correctAnswered: 0,
            incorrectAnswered: 0,
            puntuation: 0
        });
        mockAxios.onGet('http://localhost:8007/historic/testUser').reply(historicResponse.status, historicResponse.data);
    };

    const verifyStatistics = async (stats: any) => {
        await waitFor(() => {
            expect(screen.getByText(/📊 Estadísticas/i)).toBeInTheDocument();
            expect(screen.getByText((_, element) => element?.textContent === `Tiempo Jugado: ${stats.timePlayed} segundos`)).toBeInTheDocument();
            expect(screen.getByText((_, element) => element?.textContent === `Partidas Jugadas: ${stats.gamesPlayed}`)).toBeInTheDocument();
            expect(screen.getByText((_, element) => element?.textContent === `Puntuacion total: ${stats.puntuation}`)).toBeInTheDocument();
            expect(screen.getByText((_, element) => element?.textContent === `Preguntas acertadas: ${stats.correctAnswered}`)).toBeInTheDocument();
            expect(screen.getByText((_, element) => element?.textContent === `Preguntas falladas: ${stats.incorrectAnswered}`)).toBeInTheDocument();
        });
    };

    describe('Historic Component', () => {
        it('renders without crashing with no games played', async () => {
            setupMocks(
                { status: 500, data: null },
                { status: 500, data: null }
            );

            await act(async () => {
                render(
                    <MemoryRouter>
                        <Historic />
                    </MemoryRouter>
                );
            });

            await verifyStatistics({
                timePlayed: 0,
                gamesPlayed: 0,
                correctAnswered: 0,
                incorrectAnswered: 0,
                puntuation: 0
            });

            await waitFor(() => {
                expect(screen.getByText("No hay historial de preguntas disponible")).toBeInTheDocument();
            });
        });

        it('fetches and displays questions', async () => {
            const mockQuestions = [
                {
                    question: "What is the capital of France?",
                    options: ["Paris", "London", "Berlin"],
                    correctAnswer: "Paris",
                    answer: "Paris",
                    category: "Geography",
                    imageUrl: "http://example.com/image.jpg",
                    user: "testUser",
                    time: 30
                }
            ];

            setupMocks(
                { status: 200, data: { timePlayed: 20, gamesPlayed: 1, correctAnswered: 1, incorrectAnswered: 0, puntuation: 10 } },
                { status: 200, data: mockQuestions }
            );

            await act(async () => {
                render(
                    <MemoryRouter>
                        <Historic />
                    </MemoryRouter>
                );
            });

            await verifyStatistics({
                timePlayed: 20,
                gamesPlayed: 1,
                correctAnswered: 1,
                incorrectAnswered: 0,
                puntuation: 10
            });
        });
    });
});

