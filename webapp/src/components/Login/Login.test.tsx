import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import Login from './Login';
import { MemoryRouter } from 'react-router';
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
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    mockAxios.onPost('http://localhost:8000/login').reply(200, { token: 'mockToken' });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'loginTestUser' } });
      fireEvent.change(passwordInput, { target: { value: '123456q@' } });
      fireEvent.click(loginButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/main');
  });

  it('should handle error when logging in', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Unauthorized' });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'wPass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Usuario o contraseña incorrectos/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Nombre de usuario obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/Contraseña obligatoria/i)).toBeInTheDocument();
    });
  });

  it('should redirect to AddUser page when the link is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const addUserLink = screen.getByText("Don't have an account? Sign up here.");
    fireEvent.click(addUserLink);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('should show error when an unexpected error occurred', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    mockAxios.onPost('http://localhost:8000/login').reply(400, { error: 'Error desconocido' });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'wPass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Error desconocido/i)).toBeInTheDocument();
    });
  });

  it('should show error when server has errors', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    mockAxios.onPost('http://localhost:8000/login').reply(500, { error: 'Error desconocido en el servidor' });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'wPass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Error desconocido en el servidor/i)).toBeInTheDocument();
    });
  });

  it('should show error when server is unreachable', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    mockAxios.onPost('http://localhost:8000/login').reply(() => {
      const error = new Error('Request failed');
      (error as any).request = {};
      throw error;
    });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'wPass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/No se recibió respuesta del servidor/i)).toBeInTheDocument();
    });
  });

  it('should show error when request is badly sent', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    mockAxios.onPost('http://localhost:8000/login').abortRequest();

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'wPass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Error al enviar la solicitud/i)).toBeInTheDocument();
    });
  });
});