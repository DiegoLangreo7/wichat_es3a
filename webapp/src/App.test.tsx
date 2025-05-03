import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
    render(<App></App>);
    const welcomeMessage = screen.getByText(/Welcome to WICHAT/i);
    expect(welcomeMessage).toBeInTheDocument();
});

test('renders login button', () => {
    render(<App></App>);
    const loginButton = screen.getByText(/Login/i);
    expect(loginButton).toBeInTheDocument();
});

test('renders sign up button', () => {
    render(<App></App>);
    const registerButton = screen.getByText("Don't have an account? Sign up here.");
    expect(registerButton).toBeInTheDocument();
});