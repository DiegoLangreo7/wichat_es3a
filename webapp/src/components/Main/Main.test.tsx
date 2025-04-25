import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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
        mockAxios.onGet('http://localhost:8000/stats/testUser').reply(200, {
            timePlayed: 120,
            gamesPlayed: 10,
            correctAnswered: 50,
            incorrectAnswered: 20,
            puntuation: 200,
        });
        mockAxios.onGet('http://localhost:8000/getStats').reply(200, [
            { username: "testUser", puntuation: 200 },
            { username: "Player2", puntuation: 80 },
            { username: "Player3", puntuation: 60 },
        ]);
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it("should redirect to /login if there is no token", async () => {
        localStorage.removeItem("token");

        await act(async () => {
            render(
                <MemoryRouter>
                    <Main />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("should render the top 3 players and user statistics", async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Main />
                </MemoryRouter>
            );
        });

        // Espera a que los datos se rendericen correctamente
        await waitFor(() => {
            expect(screen.getByText(/Tus Estadísticas/i)).toBeInTheDocument();
            expect(screen.getByText(/Puntuación: 200/i)).toBeInTheDocument();
            expect(screen.getByText(/Partidas: 10/i)).toBeInTheDocument();
            expect(screen.getByText(/Aciertos: 50/i)).toBeInTheDocument();
            expect(screen.getByText(/Top 3 Jugadores/i)).toBeInTheDocument();
            expect(screen.getByText(/Puntos: 200/i)).toBeInTheDocument();
            expect(screen.getByText(/Puntos: 80/i)).toBeInTheDocument();
            expect(screen.getByText(/Puntos: 60/i)).toBeInTheDocument();
        });
    });

    it("should navigate to the question game mode", async () => {
        mockAxios.onPost("http://localhost:8000/initializeQuestionsDB").reply(200);

        let container : HTMLElement;
        await act(async () => {
            const rendered = render(
                <MemoryRouter>
                    <Main />
                </MemoryRouter>
            );
            container = rendered.container;
        });

        // Selecciona el botón por las clases necesarias
        const playButton = await waitFor(() =>
            container.querySelector(".MuiButtonBase-root.MuiButton-containedPrimary")
        );

        // Simula el clic en el botón
        await act(async () => {
            fireEvent.click(playButton as HTMLElement);
        });

        // Verifica que se haya navegado a la ruta esperada
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/main/question");
        });
    });

    it("should navigate to the card game mode", async () => {
        let container: HTMLElement;

        await act(async () => {
            const rendered = render(
                <MemoryRouter>
                    <Main/>
                </MemoryRouter>
            );
            container = rendered.container;
        });

        // Asegúrate de que los botones estén presentes antes de interactuar
        const nextButton = await waitFor(() =>
            screen.getByTestId("next-slide")
        );
        await act(async () => {
            fireEvent.click(nextButton as HTMLElement);
        });
        const playButton = await waitFor(() =>
            container.querySelector(".MuiButtonBase-root.MuiButton-containedPrimary")
        );
        await act(async () => {
            fireEvent.click(playButton as HTMLElement);
        });

        // Verifica la navegación
        expect(mockNavigate).toHaveBeenCalledWith("/cards");
    });
});