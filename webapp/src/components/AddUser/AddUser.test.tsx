import React from 'react';
import {render, fireEvent, screen, waitFor, act} from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AddUser from './AddUser';
import { MemoryRouter } from "react-router";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

describe('AddUser component', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockNavigate.mockReset();
    });

    it('should add user successfully', async () => {
        render(
            <MemoryRouter>
                <AddUser />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        // Mock the axios.post request to simulate a successful response
        mockAxios.onPost('http://localhost:8000/adduser').reply(200, { token: 'mockToken' });

        // Simulate user input
        await act(async () => {
            fireEvent.change(usernameInput, { target: { value: 'signInTestUser' } });
            fireEvent.change(passwordInput, { target: { value: '123456@q' } });
            fireEvent.click(addUserButton);
        });

        // Verify that the main page is displayed
        expect(mockNavigate).toHaveBeenCalledWith('/main');
    });

    it('should handle error when adding user', async () => {
        render(
            <MemoryRouter>
                <AddUser />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        // Mock the axios.post request to simulate an error response
        mockAxios.onPost('http://localhost:8000/adduser').reply(400, { error: 'Internal Server Error' });

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'testPassword' } });

        // Trigger the add user button click
        fireEvent.click(addUserButton);

        // Wait for the error Snackbar to be open
        await waitFor(() => {
            expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
        });
    });

    it('should show validation error when fields are empty', async () => {
        render(
            <MemoryRouter>
                <AddUser />
            </MemoryRouter>
        );

        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        // Trigger the add user button click without filling the fields
        fireEvent.click(addUserButton);

        // Wait for the validation error messages to be displayed
        await waitFor(() => {
            expect(screen.getByText(/Nombre de usuario obligatorio/i)).toBeInTheDocument();
            expect(screen.getByText(/Contraseña obligatoria/i)).toBeInTheDocument();
        });
    });

    it('should redirect to login page when the link is clicked', () => {
        render(
            <MemoryRouter>
                <AddUser />
            </MemoryRouter>
        );

        const loginLink = screen.getByText("Already have an account? Login here.");
        fireEvent.click(loginLink);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});


