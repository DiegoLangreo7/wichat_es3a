import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import NavBar from './NavBar';
import { MemoryRouter } from "react-router";

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe('NavBar redirections', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    const setup = () => render(
        <MemoryRouter>
            <NavBar />
        </MemoryRouter>
    );

    const clickAndAssert = (text: string, expectedRoute: string) => {
        const { getByText } = setup();
        fireEvent.click(getByText(text));
        expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
    };

    it("should redirect to /main when clicking on WI CHAT", () => {
        clickAndAssert("WI CHAT", "/main");
    });

    it("should redirect to /ranking when clicking on Ranking Global", () => {
        clickAndAssert("Ranking Global", "/ranking");
    });

    it("should redirect to /api when clicking on API Platform", () => {
        clickAndAssert("API Platform", "/api");
    });

    it("should redirect to /main/question when clicking on Preguntas", () => {
        const { getByText } = setup();
        fireEvent.click(getByText("Jugar"));
        fireEvent.click(getByText("Preguntas"));
        expect(mockNavigate).toHaveBeenCalledWith("/main/question");
    });

    it("should redirect to /cards when clicking on Memory", () => {
        const { getByText } = setup();
        fireEvent.click(getByText("Jugar"));
        fireEvent.click(getByText("Memory"));
        expect(mockNavigate).toHaveBeenCalledWith("/cards");
    });

    it("should redirect to /historic when clicking on Historial", () => {
        const { getByText } = setup();
        fireEvent.click(getByText("Usuario"));
        fireEvent.click(getByText("Historial"));
        expect(mockNavigate).toHaveBeenCalledWith("/historic");
    });

    it("should redirect to /logout when clicking on Cerrar sesión", () => {
        const { getByText } = setup();
        fireEvent.click(getByText("Usuario"));
        fireEvent.click(getByText("Cerrar sesión"));
        expect(mockNavigate).toHaveBeenCalledWith("/logout");
    });
});