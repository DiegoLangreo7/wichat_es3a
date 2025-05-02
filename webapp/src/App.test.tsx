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

test('renders welcome message', () => {
  renderAppAt();
  expect(screen.getByText(/Welcome to WICHAT/i)).toBeInTheDocument();
});

test('renders login button', () => {
  renderAppAt();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

test('renders sign up button', () => {
  renderAppAt();
  expect(screen.getByText("Don't have an account? Sign up here.")).toBeInTheDocument();
});
