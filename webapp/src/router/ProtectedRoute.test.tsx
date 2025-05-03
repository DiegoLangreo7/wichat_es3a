import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const Protected = () => <div>Protected content</div>;
const Redirected = () => <div>Redirected to login</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders protected content if token exists', () => {
    localStorage.setItem('token', 'valid-token');

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><Protected /></ProtectedRoute>} />
          <Route path="/login" element={<Redirected />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Protected content/i)).toBeInTheDocument();
  });

  test('redirects to login if token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><Protected /></ProtectedRoute>} />
          <Route path="/login" element={<Redirected />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Redirected to login/i)).toBeInTheDocument();
  });
});