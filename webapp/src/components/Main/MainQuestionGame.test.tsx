import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import axios from "axios";
import MainQuestionGame from "./MainQuestionGame";
import { MemoryRouter } from "react-router";
import MockAdapter from "axios-mock-adapter";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe("MainQuestionGame Component", () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
        localStorage.setItem("token", "test-token");
        localStorage.setItem("username", JSON.stringify("testUser"));
        mockAxios.onGet("http://localhost:8000/stats/testUser").reply(200, {
            timePlayed: 120,
            gamesPlayed: 10,
            correctAnswered: 50,
            incorrectAnswered: 20,
            puntuation: 200,
        });
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
                    <MainQuestionGame />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("should navigate to the game with selected parameters", async () => {
        let container: HTMLElement;

        await act(async () => {
            const rendered = render(
                <MemoryRouter>
                    <MainQuestionGame />
                </MemoryRouter>
            );
            container = rendered.container;
        });

        const playButton = await waitFor(() =>
            screen.getByTestId("play-button")
        );

        await act(async () => {
            fireEvent.click(playButton as HTMLElement);
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/game", {
                state: {
                    username: "testUser",
                    totalQuestions: 10,
                    timeLimit: 20, // Default value for "Medium" difficulty
                    gameMode: "country", // Default value
                },
            });
        });
    });
});