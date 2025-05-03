import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import React from 'react';
import AppRouter from '../src/router/AppRouter';

describe('App Component', () => {
  test('renderiza la ruta /login correctamente', () => {
    const testRouter = createMemoryRouter(AppRouter.routes, {
      initialEntries: ['/login'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText(/Welcome to WICHAT/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('renderiza la ruta /register correctamente', () => {
    const testRouter = createMemoryRouter(AppRouter.routes, {
      initialEntries: ['/register'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
  });

  test('muestra un error para rutas no definidas', () => {
    const testRouter = createMemoryRouter(AppRouter.routes, {
      initialEntries: ['/unknown'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
  });
});