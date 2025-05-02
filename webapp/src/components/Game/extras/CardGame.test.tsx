import { render, screen } from '@testing-library/react';
import CardGame from './CardGame';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('CardGame component', () => {
  beforeEach(() => {
    mock.reset();

    // Mock de respuesta para /cardValues
    mock.onGet('http://localhost:8000/cardValues').reply(200, {
      images: ['https://example.com/img1.png', 'https://example.com/img2.png']
    });
  });

  test('renders loading screen initially', async () => {
    render(
      <MemoryRouter>
        <CardGame />
      </MemoryRouter>
    );

    expect(screen.getByText(/Preparando juego/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});