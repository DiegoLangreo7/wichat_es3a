import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from './Login';
import App from "../../App";
import { MemoryRouter } from "react-router";
import { useNavigate } from 'react-router';

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe('Login component', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
    });

    it('should log in successfully', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        mockAxios.onPost('http://localhost:8000/login').reply(200, { token: 'mockToken' });

        // Simulate user input
        await act(async () => {
            fireEvent.change(usernameInput, { target: { value: 'loginTestUser' } });
            fireEvent.change(passwordInput, { target: { value: '123456q@' } });
            fireEvent.click(loginButton);
        });

        // Verify that the user information is displayed
        expect(mockNavigate).toHaveBeenCalledWith('/main');
    });

    it('should handle error when logging in', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Mock the axios.post request to simulate an error response
        mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Unauthorized' });

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'wPass' } });

        // Trigger the login button click
        fireEvent.click(loginButton);

        // Wait for the error Snackbar to be open
        await waitFor(() => {
            expect(screen.getByText(/Usuario o contraseña incorrectos/i)).toBeInTheDocument();
        });

        // Verify that the user information is not displayed
        expect(screen.queryByText(/Hello testUser!/i)).toBeNull();
        expect(screen.queryByText(/Your account was created on/i)).toBeNull();
    });

});

