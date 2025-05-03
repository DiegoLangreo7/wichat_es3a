import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import Login from './Login';
import { MemoryRouter } from "react-router";
import MockAdapter from 'axios-mock-adapter';

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

        // Verify that the main page is displayed
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

    it('should show validation errors', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Trigger the add user button click without filling the fields
        fireEvent.click(loginButton);

        // Wait for the validation error messages to be displayed
        await waitFor(() => {
            expect(screen.getByText(/Nombre de usuario obligatorio/i)).toBeInTheDocument();
            expect(screen.getByText(/Contraseña obligatoria/i)).toBeInTheDocument();
        });
    });

    it('should redirect to AddUser page when the link is clicked', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const addUserLink = screen.getByText("Don't have an account? Sign up here.");
        fireEvent.click(addUserLink);

        // Verify that the AddUser page is displayed
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should show error when an unexpected error occurred', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Mock the axios.post request to simulate an error response
        mockAxios.onPost('http://localhost:8000/login').reply(400, { error: 'Error desconocido' });

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'wPass' } });

        // Trigger the login button click
        fireEvent.click(loginButton);

        // Wait for the error Snackbar to be open
        await waitFor(() => {
            expect(screen.getByText(/Error desconocido/i)).toBeInTheDocument();
        });
    });

    it('should show error when server has errors', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Mock the axios.post request to simulate an error response
        mockAxios.onPost('http://localhost:8000/login').reply(500, { error: 'Error desconocido en el servidor' });

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'wPass' } });

        // Trigger the login button click
        fireEvent.click(loginButton);

        // Wait for the error Snackbar to be open
        await waitFor(() => {
            expect(screen.getByText(/Error desconocido en el servidor/i)).toBeInTheDocument();
        });
    });

    it('should show error when server is unreachable', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Mock the axios.post request to simulate an error response
        mockAxios.onPost('http://localhost:8000/login').reply(() => {
            const error = new Error('Request failed');
            (error as any).request = {}; // Agrega manualmente la propiedad request
            throw error;
        });

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'wPass' } });

        // Trigger the login button click
        fireEvent.click(loginButton);

        // Wait for the error Snackbar to be open
        await waitFor(() => {
            expect(screen.getByText(/No se recibió respuesta del servidor/i)).toBeInTheDocument();
        });
    });

    it('should show error when request is badly send', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Mock the axios.post request to simulate an error response
        mockAxios.onPost('http://localhost:8000/login').abortRequest();

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'wPass' } });

        // Trigger the login button click
        fireEvent.click(loginButton);

        // Wait for the error Snackbar to be open
        await waitFor(() => {
            expect(screen.getByText(/Error al enviar la solicitud/i)).toBeInTheDocument();
        });
    });
});