import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import axios from "axios";
import LLMChat from "./LLMChat";

jest.mock("axios");

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
            fireEvent.click(sendButton);
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
            fireEvent.click(sendButton);
        });

        expect(screen.getByText("Dame una pista")).toBeInTheDocument();
        expect(mockOnClueUsed).toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByText("La capital de Francia es París.")).toBeInTheDocument();
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
            fireEvent.click(sendButton);
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
            fireEvent.click(sendButton);
        });

        await waitFor(() => {
            expect(screen.queryByText("Ocurrió un error al procesar tu solicitud. Inténtalo nuevamente.")).not.toBeInTheDocument();
        });
    });
});