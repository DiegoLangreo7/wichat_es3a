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

    const clickAndAssert = (text: string, expectedRoute: string, twice = false, text2 = '') => {
        const { getByText } = setup();
        fireEvent.click(getByText(text));
        if (twice) {
            fireEvent.click(getByText(text2));
        }
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
        clickAndAssert("Jugar", "/main/question", true, "Preguntas y respuestas");
    });

    it("should redirect to /cards when clicking on Memory", () => {
        clickAndAssert("Jugar", "/cards", true, "Juego de memoria");
    });

    it("should redirect to /historic when clicking on Historial", () => {
        clickAndAssert("Usuario", "/historic", true, "Historial");
    });

    it("should redirect to /logout when clicking on Cerrar sesión", () => {
        clickAndAssert("Usuario", "/logout", true, "Cerrar sesión");
    });
});