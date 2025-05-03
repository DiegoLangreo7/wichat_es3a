import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

const renderAppAt = (route = '/login') => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
};

describe('Login route (/login)', () => {
  test('renders welcome message', () => {
    renderAppAt('/login');
    expect(screen.getByText(/Welcome to WICHAT/i)).toBeInTheDocument();
  });

  test('renders login button', () => {
    renderAppAt('/login');
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('renders sign up button', () => {
    renderAppAt('/login');
    expect(screen.getByText("Don't have an account? Sign up here.")).toBeInTheDocument();
  });
});

describe('Register route (/register)', () => {
  test('renders create account title', () => {
    renderAppAt('/register');
    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
  });

  test('renders add user button', () => {
    renderAppAt('/register');
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
  });
});
