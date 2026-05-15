import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TournamentsPage from '../pages/TournamentsPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/tournaments', () => ({
  getTournaments: vi.fn(),
}));

const renderPage = () =>
  render(<MemoryRouter><TournamentsPage /></MemoryRouter>);

describe('TournamentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra mensaje cuando no hay torneos', async () => {
    const { getTournaments } = await import('../api/tournaments');
    getTournaments.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No tournaments found. Create one to get started.')).toBeInTheDocument()
    );
  });

  it('muestra error si falla la carga', async () => {
    const { getTournaments } = await import('../api/tournaments');
    getTournaments.mockRejectedValueOnce(new Error('Network error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Could not load tournaments.')).toBeInTheDocument()
    );
  });

  it('muestra torneos cuando hay datos', async () => {
    const { getTournaments } = await import('../api/tournaments');
    getTournaments.mockResolvedValueOnce([
      { id: 1, name: 'Liga 2026', semester: '2026-1', category: 'MALE', status: 'ONGOING' },
      { id: 2, name: 'Copa Femenina', semester: '2026-1', category: 'FEMALE', status: 'PLANNED' },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Liga 2026')).toBeInTheDocument());
    expect(screen.getByText('Copa Femenina')).toBeInTheDocument();
  });

  it('navega al dashboard al seleccionar un torneo', async () => {
    const { getTournaments } = await import('../api/tournaments');
    getTournaments.mockResolvedValueOnce([
      { id: 1, name: 'Liga 2026', semester: '2026-1', category: 'MALE', status: 'ONGOING' },
    ]);
    renderPage();
    await waitFor(() => screen.getByText('Liga 2026'));
    await userEvent.click(screen.getByText('Liga 2026'));
    expect(mockNavigate).toHaveBeenCalledWith('/tournament/1/dashboard');
  });

  it('navega a crear torneo', async () => {
    const { getTournaments } = await import('../api/tournaments');
    getTournaments.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => screen.getByText('New Tournament'));
    await userEvent.click(screen.getByText('New Tournament'));
    expect(mockNavigate).toHaveBeenCalledWith('/tournaments/new');
  });

  it('sign out limpia token y navega a login', async () => {
    const { getTournaments } = await import('../api/tournaments');
    getTournaments.mockResolvedValueOnce([]);
    localStorage.setItem('token', 'fake-token');
    renderPage();
    await waitFor(() => screen.getByText('Sign out'));
    await userEvent.click(screen.getByText('Sign out'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});