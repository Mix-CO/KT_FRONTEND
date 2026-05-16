import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamViewPage from '../pages/TeamViewPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/teams', () => ({
  getTeamsByTournament: vi.fn(),
}));

vi.mock('../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tournament/1/teams']}>
      <Routes>
        <Route path="/tournament/:tournamentId/teams" element={<TeamViewPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('TeamViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra mensaje cuando no hay equipos', async () => {
    const { getTeamsByTournament } = await import('../api/teams');
    getTeamsByTournament.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No hay equipos registrados aún')).toBeInTheDocument()
    );
  });

  it('muestra error si falla la carga', async () => {
    const { getTeamsByTournament } = await import('../api/teams');
    getTeamsByTournament.mockRejectedValueOnce(new Error('Error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No se pudieron cargar los equipos del torneo.')).toBeInTheDocument()
    );
  });

  it('muestra lista de equipos', async () => {
    const { getTeamsByTournament } = await import('../api/teams');
    getTeamsByTournament.mockResolvedValueOnce([
      { id: 1, name: 'Equipo Alpha', captainName: 'Juan', players: [{}, {}] },
      { id: 2, name: 'Equipo Beta', captainName: 'Pedro', players: [{}] },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Equipo Alpha')).toBeInTheDocument());
    expect(screen.getByText('Equipo Beta')).toBeInTheDocument();
    expect(screen.getByText('Juan')).toBeInTheDocument();
  });

  it('navega al detalle del equipo al hacer click en Ver', async () => {
    const { getTeamsByTournament } = await import('../api/teams');
    getTeamsByTournament.mockResolvedValueOnce([
      { id: 1, name: 'Equipo Alpha', captainName: 'Juan', players: [] },
    ]);
    renderPage();
    await waitFor(() => screen.getByText('Equipo Alpha'));
    await userEvent.click(screen.getByRole('button', { name: /ver/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/tournament/1/teams/1');
  });

  it('navega a crear equipo', async () => {
    const { getTeamsByTournament } = await import('../api/teams');
    getTeamsByTournament.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => screen.getByText('+ Crear Equipo'));
    await userEvent.click(screen.getByText('+ Crear Equipo'));
    expect(mockNavigate).toHaveBeenCalledWith('/tournament/1/teams/new');
  });
});