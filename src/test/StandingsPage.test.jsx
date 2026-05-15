import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StandingsPage from '../pages/StandingsPage';

vi.mock('../api/tournaments', () => ({
  getTournament: vi.fn().mockResolvedValue({ id: 1, name: 'Torneo Test', semester: '2026-1' }),
}));

vi.mock('../api/standings', () => ({
  getStandingsByTournament: vi.fn().mockResolvedValue([]),
}));

vi.mock('../api/matches', () => ({
  getMatchesByTournament: vi.fn().mockResolvedValue([]),
}));

vi.mock('../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tournament/1/standings']}>
      <Routes>
        <Route path="/tournament/:tournamentId/standings" element={<StandingsPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('StandingsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el título Standings', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Standings')).toBeInTheDocument());
  });

  it('muestra mensaje cuando no hay equipos', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No hay equipos en la tabla aún')).toBeInTheDocument()
    );
  });

  it('muestra mensaje cuando no hay resultados', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No hay resultados aún')).toBeInTheDocument()
    );
  });

  it('muestra standings cuando hay datos', async () => {
    const { getStandingsByTournament } = await import('../api/standings');
    getStandingsByTournament.mockResolvedValueOnce([
      { id: 1, teamName: 'Equipo A', played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 5, goalsAgainst: 2, points: 7 },
      { id: 2, teamName: 'Equipo B', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 5, points: 3 },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Equipo A')).toBeInTheDocument());
    expect(screen.getByText('Equipo B')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('muestra resultados jugados', async () => {
    const { getMatchesByTournament } = await import('../api/matches');
    getMatchesByTournament.mockResolvedValueOnce([
      { id: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo B', homeScore: 2, awayScore: 1, status: 'PLAYED' },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Equipo A')).toBeInTheDocument());
    expect(screen.getByText('Equipo B')).toBeInTheDocument();
  });
});