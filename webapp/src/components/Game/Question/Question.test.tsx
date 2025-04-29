import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Question from "./Question";

describe("Question Component", () => {
    const mockOnAnswer = jest.fn();

    const mockQuestion = {
        _id: "1",
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        correctAnswer: "Paris",
        category: "Geography",
        imageUrl: "http://example.com/image.jpg",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the question and options", () => {
        render(
            <Question
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                isTransitioning={false}
                disabled={false}
            />
        );

        expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
        expect(screen.getByAltText("Imagen")).toBeInTheDocument();
        mockQuestion.options.forEach((option) => {
            expect(screen.getByText(option)).toBeInTheDocument();
        });
    });

    it("handles answer selection", async () => {
        render(
            <Question
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                isTransitioning={false}
                disabled={false}
            />
        );

        const parisButton = screen.getByText("Paris");
        fireEvent.click(parisButton);

        expect(mockOnAnswer).toHaveBeenCalledWith(true, "Paris");
    });

    it("disables buttons when transitioning", async () => {
        render(
            <Question
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                isTransitioning={true}
                disabled={false}
            />
        );

        const parisButton = screen.getByText("Paris");
        fireEvent.click(parisButton);
        const berlinButton = screen.getByText("Berlin");
        const madridButton = screen.getByText("Madrid");
        const romaButton = screen.getByText("Rome");

        await waitFor(() => {
            expect(berlinButton).toBeDisabled();
            expect(madridButton).toBeDisabled();
            expect(romaButton).toBeDisabled();
        });

        expect(mockOnAnswer).not.toHaveBeenCalled();
    });

    it("resets selected option when question changes", async () => {
        const { rerender } = render(
            <Question
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                isTransitioning={false}
                disabled={false}
            />
        );

        const parisButton = screen.getByText("Paris");
        fireEvent.click(parisButton);

        const newQuestion = {
            ...mockQuestion,
            _id: "2",
            question: "What is the capital of Germany?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            correctAnswer: "Berlin",
        };

        rerender(
            <Question
                question={newQuestion}
                onAnswer={mockOnAnswer}
                isTransitioning={false}
                disabled={false}
            />
        );

        const berlinButton = screen.getByText("Berlin");
        expect(berlinButton).not.toHaveClass("MuiButton-containedError");
    });

    it("does not allow selection when disabled", () => {
        render(
            <Question
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                isTransitioning={false}
                disabled={true}
            />
        );

        const parisButton = screen.getByText("Paris");
        fireEvent.click(parisButton);

        expect(mockOnAnswer).not.toHaveBeenCalled();
    });
});