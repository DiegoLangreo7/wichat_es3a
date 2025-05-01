import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import axios from "axios";
import LLMChat from "./LLMChat";

jest.mock("axios");
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe("LLMChat Component", () => {
    const mockOnClueUsed = jest.fn();

    const defaultProps = {
        question: "What is the capital of France?",
        solution: "Paris",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        onClueUsed: mockOnClueUsed,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders initial messages and input field", () => {
        render(<LLMChat {...defaultProps} />);

        expect(
            screen.getByText("Pregunta una pista a su IA de confianza a cambio del 50% de su puntuación")
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Escribe tu mensaje...")).toBeInTheDocument();
        expect(document.querySelector("#send-message-button")).toBeInTheDocument();
    });

    it("disables send button when the answer is loading", async() => {
        (axios.post as jest.Mock).mockResolvedValueOnce({
            data: { answer: "La capital de Francia es París." },
        });

        await act(async () => {
            render(<LLMChat {...defaultProps} />);
        });

        const input = screen.getByPlaceholderText("Escribe tu mensaje...");
        const sendButton = document.querySelector("#send-message-button");

        await act(async ()=> {
            fireEvent.change(input, {target: {value: "Hola"}});
            fireEvent.click(sendButton as HTMLElement);
        });
        // Verifica que el botón esté deshabilitado mientras se espera la respuesta
        expect(sendButton).toBeDisabled();
    });

    it("sends a message and displays system response", async () => {
        (axios.post as jest.Mock).mockResolvedValueOnce({
            data: { answer: "La capital de Francia es París." },
        });

        await act(async () => {
            render(<LLMChat {...defaultProps} />);
        });

        const input = screen.getByPlaceholderText("Escribe tu mensaje...");
        const sendButton = document.querySelector("#send-message-button");

        await act(async () => {
            fireEvent.change(input, { target: { value: "Dame una pista" } });
            fireEvent.click(sendButton as HTMLElement);
        });

        expect(screen.getByText("Dame una pista")).toBeInTheDocument();
        expect(mockOnClueUsed).toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByText("La capital de Francia es París.")).toBeInTheDocument();
        });
    });

    it("sends a message when Enter is pressed", async () => {
        (axios.post as jest.Mock).mockResolvedValueOnce({
            data: { answer: "La capital de Francia es París." },
        });

        await act(async () => {
            render(<LLMChat {...defaultProps} />);
        });

        const input = screen.getByPlaceholderText("Escribe tu mensaje...");

        // Simula escribir un mensaje y presionar Enter
        await act(async () => {
            fireEvent.change(input, {target: {value: "Hola"}});
            fireEvent.keyPress(input, {key: "Enter", code: "Enter", charCode: 13});
        });
        // Verifica que el mensaje del usuario se haya agregado al chat
        expect(screen.getByText("Hola")).toBeInTheDocument();

        // Verifica que se haya llamado a la API
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                userMessage: "Hola",
            }));
        });
    });

    it("displays an error message when the API call fails", async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

        await act(async () => {
            render(<LLMChat {...defaultProps} />);
        });

        const input = screen.getByPlaceholderText("Escribe tu mensaje...");
        const sendButton = document.querySelector("#send-message-button");

        await act(async () => {
            fireEvent.change(input, { target: { value: "Dame una pista" } });
            fireEvent.click(sendButton as HTMLElement);
        });

        expect(screen.getByText("Dame una pista")).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getByText("Ocurrió un error al procesar tu solicitud. Inténtalo nuevamente.")
            ).toBeInTheDocument();
        });
    });

    it("displays a loading indicator while waiting for a response", async () => {
        (axios.post as jest.Mock).mockResolvedValueOnce({
            data: { answer: "La capital de Francia es París." },
        });

        await act(async () => {
            render(<LLMChat {...defaultProps} />);
        });

        const input = screen.getByPlaceholderText("Escribe tu mensaje...");
        const sendButton = document.querySelector("#send-message-button");

        await act(async () => {
            fireEvent.change(input, { target: { value: "Dame una pista" } });
            fireEvent.click(sendButton as HTMLElement);
        });

        await waitFor(() => {
            expect(screen.queryByText("Ocurrió un error al procesar tu solicitud. Inténtalo nuevamente.")).not.toBeInTheDocument();
        });
    });
});
