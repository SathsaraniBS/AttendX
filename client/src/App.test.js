import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// ===== LOGIN PAGE RENDER TEST =====
test('renders login page on default route', () => {
  render(<App />);
  const loginHeading = screen.getByText(/login/i);
  expect(loginHeading).toBeInTheDocument();
});

// ===== ATTENDX TITLE TEST =====
test('renders AttendX branding', () => {
  render(<App />);
  const brand = screen.getByText(/attendx/i);
  expect(brand).toBeInTheDocument();
});