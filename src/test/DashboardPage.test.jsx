import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

vi.mock('../api/tournaments', () => ({
  getTournament: vi.fn().mockResolvedValue({ id: 1, name: 'Torneo Test', semester: '2026-1' }),
  getTeamsInTournament: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
}));

vi.mock('../api/matches', () => ({
  getMatchesByTournament: vi.fn().mockResolvedValue([]),
}));

vi.mock('../api/standings', () => ({
  getStandingsByTournament: vi.fn().mockResolvedValue([]),
}));

vi.mock('../api/ai', () => ({
  getAiSuggestion: vi.fn().mockResolvedValue(null),
}));

vi.mock('../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tournament/1/dashboard']}>
      <Routes>
        <Route path="/tournament/:tournamentId/dashboard" element={<DashboardPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el título Dashboard', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
  });

  it('muestra el número de equipos', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('02')).toBeInTheDocument());
  });

  it('muestra No upcoming matches si no hay partidos confirmados', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No upcoming matches')).toBeInTheDocument()
    );
  });

  it('muestra próximo partido SCHEDULED si no hay CONFIRMED', async () => {
    const { getMatchesByTournament } = await import('../api/matches');
    getMatchesByTournament.mockResolvedValueOnce([
      { id: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo B', status: 'SCHEDULED' },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Equipo A vs Equipo B')).toBeInTheDocument());
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('prioriza partido CONFIRMED sobre SCHEDULED', async () => {
    const { getMatchesByTournament } = await import('../api/matches');
    getMatchesByTournament.mockResolvedValueOnce([
      { id: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo B', status: 'SCHEDULED' },
      { id: 2, homeTeamName: 'Equipo C', awayTeamName: 'Equipo D', status: 'CONFIRMED' },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Equipo C vs Equipo D')).toBeInTheDocument());
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('muestra sin sugerencia IA cuando no hay partidos', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Sin sugerencia de IA disponible')).toBeInTheDocument()
    );
  });
});