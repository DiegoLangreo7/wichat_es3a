import React from 'react';
import { render } from '@testing-library/react';
import RetroRain from './RetroRain';

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, 'location', {
    value: { pathname: '/login' },
    writable: true
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn()
    }))
  });
});

test('renders RetroRain when enabled and path is /login', () => {
  localStorage.setItem('showAnimation', 'true');
  render(<RetroRain />);
  const drops = document.querySelectorAll('.pixel-drop');
  expect(drops.length).toBeGreaterThan(0);
});

test('does not render when animation is disabled', () => {
  localStorage.setItem('showAnimation', 'false');
  render(<RetroRain />);
  expect(document.querySelectorAll('.pixel-drop').length).toBe(0);
});

test('does not render outside allowed routes', () => {
  window.location.pathname = '/main';
  localStorage.setItem('showAnimation', 'true');
  render(<RetroRain />);
  expect(document.querySelectorAll('.pixel-drop').length).toBe(0);
});