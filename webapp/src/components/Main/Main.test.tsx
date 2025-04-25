import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import Main from "./Main";
import { MemoryRouter } from "react-router";
import MockAdapter from "axios-mock-adapter";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe("Main Component", () => {
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

    it("should redirect to /login if there is no token", () => {
        localStorage.removeItem("token");
        render(
            <MemoryRouter>
                <Main />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should render the top 3 players and user statistics", async () => {
        // Configura el mock de Axios antes de renderizar el componente
        mockAxios.onGet('http://localhost:8000/stats/testUser').reply(200, {
            data: {
                timePlayed: 120,
                gamesPlayed: 10,
                correctAnswered: 50,
                incorrectAnswered: 20,
                puntuation: 200,
            },
        });

        mockAxios.onGet('http://localhost:8000/getStats').reply(200, [
            { username: "Player1", puntuation: 100 },
            { username: "Player2", puntuation: 80 },
            { username: "Player3", puntuation: 60 },
        ]);

        render(
            <MemoryRouter>
                <Main />
            </MemoryRouter>
        );

        // Espera a que los datos se rendericen correctamente
        await waitFor(() => {
            expect(screen.getByText(/Top 3 Jugadores/i)).toBeInTheDocument();
            expect(screen.getByText(/Tus Estadísticas/i)).toBeInTheDocument();
            expect(screen.getByText(/Puntuación: 200/i)).toBeInTheDocument();
            expect(screen.getByText(/Partidas: 10/i)).toBeInTheDocument();
            expect(screen.getByText(/Aciertos: 50/i)).toBeInTheDocument();
        });
    });

    it("should navigate to the question game mode", async () => {
        // Configura el mock de Axios antes de renderizar el componente
        mockAxios.onGet('http://localhost:8000/stats/testUser').reply(200, {
            data: {
                timePlayed: 120,
                gamesPlayed: 10,
                correctAnswered: 50,
                incorrectAnswered: 20,
                puntuation: 200,
            },
        });

        mockAxios.onGet('http://localhost:8000/getStats').reply(200, [
            { username: "Player1", puntuation: 100 },
            { username: "Player2", puntuation: 80 },
            { username: "Player3", puntuation: 60 },
        ]);

        mockAxios.onPost("http://localhost:8000/initializeQuestionsDB").reply(200);

        const { container } = render(
            <MemoryRouter>
                <Main />
            </MemoryRouter>
        );

        // Selecciona el botón por las clases necesarias
        const playButton = container.querySelector(".MuiButtonBase-root.MuiButton-containedPrimary") as HTMLElement;

        // Simula el clic en el botón
        fireEvent.click(playButton);

        // Verifica que se haya navegado a la ruta esperada
        expect(mockNavigate).toHaveBeenCalledWith("/main/question");
    });

    it("should navigate to the card game mode", async () => {
        // Configura el mock de Axios antes de renderizar el componente
        mockAxios.onGet('http://localhost:8000/stats/testUser').reply(200, {
            data: {
                timePlayed: 120,
                gamesPlayed: 10,
                correctAnswered: 50,
                incorrectAnswered: 20,
                puntuation: 200,
            },
        });

        mockAxios.onGet('http://localhost:8000/getStats').reply(200, [
            { username: "Player1", puntuation: 100 },
            { username: "Player2", puntuation: 80 },
            { username: "Player3", puntuation: 60 },
        ]);

        const { container } = render(
            <MemoryRouter>
                <Main />
            </MemoryRouter>
        );

        // Selecciona el botón por las clases necesarias
        const nextButton = container.querySelector(".MuiSvgIcon-root.MuiSvgIcon-fontSizeLarge.css-uks7c6-MuiSvgIcon-root");
        const playButton = container.querySelector(".MuiButtonBase-root.MuiButton-containedPrimary");

        // Simula el clic en el botón
        fireEvent.click(nextButton as HTMLElement);
        fireEvent.click(playButton as HTMLElement);

        // Verifica que se haya navegado a la ruta esperada
        expect(mockNavigate).toHaveBeenCalledWith("/cards");
    });
});