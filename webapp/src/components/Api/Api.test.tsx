import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router";
import MockAdapter from "axios-mock-adapter";
import Api from "./Api";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

const renderApiComponent = async () => {
    await act(async () => {
        render(
            <MemoryRouter>
                <Api />
            </MemoryRouter>
        );
    });
};

const clickTab = async (tabText: string) => {
    await act(async () => {
        fireEvent.click(screen.getByText(new RegExp(tabText, "i")));
    });
};

describe("Api Component", () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
        mockAxios.onGet('http://localhost:8006/api/users').reply(200, []);
        mockAxios.onGet('http://localhost:8006/api/questions').reply(200, []);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render the component correctly", async () => {
        await renderApiComponent();

        expect(screen.getByText(/API Explorer/i)).toBeInTheDocument();
        expect(screen.getByText(/Visualización de datos desde los endpoints de la API/i)).toBeInTheDocument();
    });

    it("should display an error message if fetching users fails", async () => {
        mockAxios.onGet('http://localhost:8006/api/users').reply(500, { error: "Error al cargar usuarios" });

        await renderApiComponent();

        await waitFor(() => {
            expect(screen.getByText(/Error al cargar usuarios/i)).toBeInTheDocument();
        });
    });

    it("should display an error message if fetching questions fails", async () => {
        mockAxios.onGet('http://localhost:8006/api/questions').reply(500, { error: "Error al cargar preguntas" });

        await renderApiComponent();
        await clickTab("Preguntas");

        await waitFor(() => {
            expect(screen.getByText(/Error al cargar preguntas/i)).toBeInTheDocument();
        });
    });

    it("should display user data correctly", async () => {
        const mockUsers = [
            { _id: "1", username: "Usuario1", createdAt: "2023-01-01T00:00:00Z", stats: { correctAnswered: 10, incorrectAnswered: 5 } },
        ];
        mockAxios.onGet('http://localhost:8006/api/users').reply(200, mockUsers);

        await renderApiComponent();

        await waitFor(() => {
            expect(screen.getByText(/Usuario1/i)).toBeInTheDocument();
            expect(screen.getByText(/Correctas: 10/i)).toBeInTheDocument();
            expect(screen.getByText(/Incorrectas: 5/i)).toBeInTheDocument();
        });
    });

    it("should display question data correctly", async () => {
        const mockQuestions = [
            { _id: "1", question: "¿Cuál es la capital de Francia?", options: ["París", "Madrid"], correctAnswer: "París", category: "Geografía" },
        ];
        mockAxios.onGet('http://localhost:8006/api/questions').reply(200, mockQuestions);

        await renderApiComponent();
        await clickTab("Preguntas");

        await waitFor(() => {
            expect(screen.getByText(/¿Cuál es la capital de Francia?/i)).toBeInTheDocument();
            expect(screen.getByText(/París/i)).toBeInTheDocument();
            expect(screen.getByText(/Geografía/i)).toBeInTheDocument();
        });
    });

    it("should reload data when clicking the refresh button", async () => {
        const mockUsers = [{ _id: "1", username: "Usuario1" }];
        const mockQuestions = [{ _id: "1", question: "¿Cuál es la capital de Francia?" }];

        mockAxios.onGet('http://localhost:8006/api/users').reply(200, mockUsers);
        mockAxios.onGet('http://localhost:8006/api/questions').reply(200, mockQuestions);

        await renderApiComponent();

        await waitFor(() => {
            expect(screen.getByText(/Usuario1/i)).toBeInTheDocument();
        });

        await clickTab("Preguntas");

        await waitFor(() => {
            expect(screen.getByText(/¿Cuál es la capital de Francia?/i)).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Actualizar datos/i));
        });

        await waitFor(() => {
            expect(screen.getByText(/¿Cuál es la capital de Francia?/i)).toBeInTheDocument();
        });

        await clickTab("Usuarios");

        await waitFor(() => {
            expect(screen.getByText(/Usuario1/i)).toBeInTheDocument();
        });
    });
});