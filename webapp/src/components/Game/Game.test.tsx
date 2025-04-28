import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Game from "./Game";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

const mockQuestion = {
    _id: "1",
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: "Paris",
    category: "Geography",
    imageUrl: "http://example.com/image.jpg",
};

describe("Game Component", () => {
    beforeAll(() => {
        Object.defineProperty(global, 'Image', {
            writable: true,
            value: class {
                src = '';
                onload = () => {};
                onerror = () => {};
                set src(value: string) {
                    this._src = value;
                    // Simula que la imagen se carga correctamente
                    setTimeout(() => {
                        if (this.onload) this.onload();
                    }, 100);
                }
            },
        });
    });

    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
        mockAxios.onGet('http://localhost:8000/questions/undefined').reply(200, mockQuestion);
        mockAxios.onPost('http://localhost:8007/historic/addQuestion').reply(200);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ("should render the Game component correctly", async () => {
        jest.useFakeTimers();

        await act(async () => {
            render(
                <MemoryRouter>
                    <Game />
                </MemoryRouter>
            );
        });

        jest.advanceTimersByTime(3000);

        await waitFor(() => {
            expect(screen.getByText(/Ronda: 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Pedir Pista/i)).toBeInTheDocument();
        });
    });

    it("should render the component correctly with loading state", async () => {
        jest.useFakeTimers();
        mockAxios.onGet('http://localhost:8000/questions/undefined').replyOnce(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([200, mockQuestion]);
                }, 2000);
            });
        });

        await act(async () => {
            render(
                <MemoryRouter>
                    <Game />
                </MemoryRouter>
            );
        });

        // Verifica que el texto de carga aparece mientras espera la respuesta
        expect(screen.getByText(/Cargando pregunta.../i)).toBeInTheDocument();

        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Cargando pregunta.../i)).not.toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    it("should display an error message if questions fail to load", async () => {
        mockAxios.onGet('http://localhost:8000/questions/undefined').reply(500);
        await act(async ()=> {
            render(
                <MemoryRouter>
                    <Game />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar preguntas para esta categoría./i)).toBeInTheDocument();
        });
    });

    it("should toggle the clue button text", async () => {
        await act(async ()=> {
            render(
                <MemoryRouter>
                    <Game />
                </MemoryRouter>
            );
        });

        const clueButton = await screen.findByText(/Pedir Pista/i);
        await act(async ()=> {
            fireEvent.click(clueButton);
        });

        expect(screen.getByText(/Cerrar Pista/i)).toBeInTheDocument();
        await act(async ()=> {
            fireEvent.click(clueButton);
        });

        expect(screen.getByText(/Pedir Pista/i)).toBeInTheDocument();
    });

    it("debería navegar a la pantalla de fin del juego cuando se completen todas las rondas", async () => {
        jest.useFakeTimers();

        const TOTAL_ROUNDS = 10;

        await act(async () => {
            render(
                <MemoryRouter>
                    <Game />
                </MemoryRouter>
            );
        });

        for (let i = 0; i < TOTAL_ROUNDS; i++) {
            const correctOption = await screen.findByText(/Paris/i);

            await act(async () => {
                fireEvent.click(correctOption);
                jest.advanceTimersByTime(5000); // tiempo para mostrar siguiente pregunta
            });

            await act(async () => {
                jest.advanceTimersByTime(1000);
            });
        }

        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        // Verifica que se navega a la pantalla de fin del juego
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/endGame", expect.any(Object));
        });

        jest.useRealTimers();
    });

    it("should decrement the timer correctly", async () => {
        jest.useFakeTimers();

        await act(async ()=> {
            render(
                <MemoryRouter>
                    <Game />
                </MemoryRouter>
            );
        });

        expect(await screen.findByText(/Ronda: 1/i)).toBeInTheDocument();

        await act(async() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.getByText(/59/i)).toBeInTheDocument();
    });

    it("should fetch questions based on gameMode", async () => {
        mockAxios.onGet("http://localhost:8000/questions/geography").reply(200, mockQuestion);

        await act(async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/game",
                            state: { gameMode: "geography" }, // Pasamos el gameMode aquí
                        },
                    ]}
                >
                    <Game />
                </MemoryRouter>
            );
        });

        expect(mockAxios.history.get[0].url).toBe("http://localhost:8000/questions/geography");
        expect(await screen.findByText(/What is the capital of France?/i)).toBeInTheDocument();
    });

});