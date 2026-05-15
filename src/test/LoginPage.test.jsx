import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/auth', () => ({
  login: vi.fn(),
}));

const renderPage = () =>
  render(<MemoryRouter><LoginPage /></MemoryRouter>);

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza el formulario de login', () => {
    renderPage();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@university.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('muestra error con credenciales incorrectas', async () => {
    const { login } = await import('../api/auth');
    login.mockRejectedValueOnce(new Error('Unauthorized'));
    renderPage();

    await userEvent.type(screen.getByPlaceholderText('name@university.edu'), 'test@uni.edu');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText('Credenciales incorrectas. Verifica tu email y contraseña.')).toBeInTheDocument()
    );
  });

  it('navega a /tournaments tras login exitoso', async () => {
    const { login } = await import('../api/auth');
    login.mockResolvedValueOnce({ token: 'fake-token' });
    renderPage();

    await userEvent.type(screen.getByPlaceholderText('name@university.edu'), 'test@uni.edu');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/tournaments'));
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('toggle muestra y oculta la contraseña', async () => {
    renderPage();
    const input = screen.getByPlaceholderText('••••••••');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByText('👁'));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('checkbox keep me logged in funciona', async () => {
    renderPage();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});