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

        expect(screen.getByText(/🏆 Ranking Global/i)).toBeInTheDocument();
        expect(screen.getByText(/Posición/i)).toBeInTheDocument();
        expect(screen.getByText(/Puntuación/i)).toBeInTheDocument();
    });

    it("should display the top 3 users correctly", async () => {
        await renderRankingComponent();

        await waitFor(() => {
            expect(document.querySelector("#ranking-table-0")).toHaveTextContent("🥇 1");
            expect(document.querySelector("#ranking-table-user-0")).toHaveTextContent("User1");
            expect(document.querySelector("#ranking-table-score-0")).toHaveTextContent("100");

            expect(document.querySelector("#ranking-table-1")).toHaveTextContent("🥈 2");
            expect(document.querySelector("#ranking-table-user-1")).toHaveTextContent("User2");
            expect(document.querySelector("#ranking-table-score-1")).toHaveTextContent("90");

            expect(document.querySelector("#ranking-table-2")).toHaveTextContent("🥉 3");
            expect(document.querySelector("#ranking-table-user-2")).toHaveTextContent("User3");
            expect(document.querySelector("#ranking-table-score-2")).toHaveTextContent("80");
        });
    });

    it("should display the user context correctly if not in the top 3", async () => {
        await renderRankingComponent();

        await waitFor(() => {
            expect(document.querySelector("#ranking-table-around-row-0")).toHaveTextContent("4");
            expect(document.querySelector("#ranking-table-around-row-0-user")).toHaveTextContent("User4");
            expect(document.querySelector("#ranking-table-around-row-0-score")).toHaveTextContent("70");

            expect(document.querySelector("#ranking-table-around-row-1")).toHaveTextContent("5");
            expect(document.querySelector("#ranking-table-around-row-1-user")).toHaveTextContent("CurrentUser");
            expect(document.querySelector("#ranking-table-around-row-1-score")).toHaveTextContent("60");

            expect(document.querySelector("#ranking-table-around-row-2")).toHaveTextContent("6");
            expect(document.querySelector("#ranking-table-around-row-2-user")).toHaveTextContent("User5");
            expect(document.querySelector("#ranking-table-around-row-2-score")).toHaveTextContent("50");
        });
    });

    it("should handle errors when fetching the ranking", async () => {
        mockAxios.onGet("http://localhost:8001/getStats").reply(500);

        await renderRankingComponent();

        await waitFor(() => {
            expect(mockAxios.history.get.length).toBe(1); // Verifica que se intentó enviar la solicitud
        });
    });
});