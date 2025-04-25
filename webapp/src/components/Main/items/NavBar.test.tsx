import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import NavBar from './NavBar';
import { MemoryRouter } from "react-router";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe('NavBar redirections', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
    });

    it("should redirect to /main when clicking on WI CHAT", () => {
        const { getByText } = render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        fireEvent.click(getByText("WI CHAT"));
        expect(mockNavigate).toHaveBeenCalledWith("/main");
    });

    it("should redirect to /ranking when clicking on Ranking Global", () => {
        const { getByText } = render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        fireEvent.click(getByText("Ranking Global"));
        expect(mockNavigate).toHaveBeenCalledWith("/ranking");
    });

    it("should redirect to /api when clicking on API Platform", () => {
        const { getByText } = render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        fireEvent.click(getByText("API Platform"));
        expect(mockNavigate).toHaveBeenCalledWith("/api");
    });

    it("should redirect to /main/question when clicking on Preguntas", () => {
        const { getByText } = render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        fireEvent.click(getByText("Jugar"));
        fireEvent.click(getByText("Preguntas"));
        expect(mockNavigate).toHaveBeenCalledWith("/main/question");
    });

    it("should redirect to /cards when clicking on Memory", () => {
        const { getByText } = render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        fireEvent.click(getByText("Jugar"));
        fireEvent.click(getByText("Memory"));
        expect(mockNavigate).toHaveBeenCalledWith("/cards");
    });

    it("should redirect to /historic when clicking on Historial", () => {
        const { getByText } = render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        fireEvent.click(getByText("Usuario"));
        fireEvent.click(getByText("Historial"));
        expect(mockNavigate).toHaveBeenCalledWith("/historic");
    });

    it("should redirect to /logout when clicking on Cerrar sesión", () => {
        const { getByText } = render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        fireEvent.click(getByText("Usuario"));
        fireEvent.click(getByText("Cerrar sesión"));
        expect(mockNavigate).toHaveBeenCalledWith("/logout");
    });
});

