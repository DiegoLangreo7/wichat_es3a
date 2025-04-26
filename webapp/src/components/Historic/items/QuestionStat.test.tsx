import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import QuestionStat from './QuestionStat';
import { MemoryRouter } from "react-router";
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe('QuestionStat Component', () => {
    const question = {
        options: ["Option 1", "Option 2", "Option 3"],
        correctAnswer: "Option 1",
        answer: "Option 1",
        category: "Category",
        imageUrl: "http://example.com/image.jpg",
        user: "testUser",
        time: 30
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <QuestionStat question={question} />
            </MemoryRouter>
        );
    });

    it('displays the question image', async () => {
        render(
            <MemoryRouter>
                <QuestionStat question={question} />
            </MemoryRouter>
        );

        const img = screen.getByTestId('question-image');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', question.imageUrl);
    });

    it('displays the correct answer', () => {
        render(
            <MemoryRouter>
                <QuestionStat question={question} />
            </MemoryRouter>
        );

        const correctAnswerChip = screen.getByText(question.correctAnswer);
        expect(correctAnswerChip).toBeInTheDocument();
    });
});