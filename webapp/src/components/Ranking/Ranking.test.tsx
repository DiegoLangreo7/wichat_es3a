import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter } from "react-router";
import Ranking from "./Ranking";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

const mockData = [
    { username: "User1", puntuation: 100 },
    { username: "User2", puntuation: 90 },
    { username: "User3", puntuation: 80 },
    { username: "User4", puntuation: 70 },
    { username: "CurrentUser", puntuation: 60 },
    { username: "User5", puntuation: 50 },
];

const renderRankingComponent = async () => {
    await act(async () => {
        render(
            <MemoryRouter>
                <Ranking />
            </MemoryRouter>
        );
    });
};

describe("Ranking Component", () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
        localStorage.clear();
        localStorage.setItem("username", JSON.stringify("CurrentUser"));
        mockAxios.onGet("http://localhost:8001/getStats").reply(200, mockData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render the component correctly", async () => {
        await renderRankingComponent();
        expect(screen.getByText(/Ranking de Jugadores/i)).toBeInTheDocument();
    });

    it("should display the top 3 users correctly", async () => {
        await renderRankingComponent();

        await waitFor(() => {
            expect(screen.getByText("User1")).toBeInTheDocument();
            expect(screen.getByText("Puntos: 100")).toBeInTheDocument();
            expect(screen.getByText("User2")).toBeInTheDocument();
            expect(screen.getByText("Puntos: 90")).toBeInTheDocument();
            expect(screen.getByText("User3")).toBeInTheDocument();
            expect(screen.getByText("Puntos: 80")).toBeInTheDocument();
        });
    });

    it("should display the user context correctly if not in the top 3", async () => {
        await renderRankingComponent();

        await waitFor(() => {
            expect(screen.getByText("User4")).toBeInTheDocument();
            expect(screen.getByText("Puntos: 70")).toBeInTheDocument();
            expect(screen.getAllByText("CurrentUser").length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText("Puntos: 60")).toBeInTheDocument();
            expect(screen.getByText("User5")).toBeInTheDocument();
            expect(screen.getByText("Puntos: 50")).toBeInTheDocument();
        });
    });

    it("should handle errors when fetching the ranking", async () => {
        mockAxios.onGet("http://localhost:8001/getStats").reply(500);

        await renderRankingComponent();

        await waitFor(() => {
            expect(mockAxios.history.get.length).toBe(1);
        });
    });
});