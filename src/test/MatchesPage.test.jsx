import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MatchesPage from '../pages/MatchesPage';

vi.mock('../api/tournaments', () => ({
  getTournament: vi.fn().mockResolvedValue({ id: 1, name: 'Torneo Test', semester: '2026-1' }),
}));

vi.mock('../api/matches', () => ({
  getMatchesByTournament: vi.fn().mockResolvedValue([]),
  createMatch: vi.fn().mockResolvedValue({ id: 1, homeTeamName: 'A', awayTeamName: 'B', status: 'SCHEDULED' }),
  recordMatchResult: vi.fn().mockResolvedValue({}),
}));

vi.mock('../api/teams', () => ({
  getTeamsByTournament: vi.fn().mockResolvedValue([
    { id: 1, name: 'Equipo A' },
    { id: 2, name: 'Equipo B' },
  ]),
}));

vi.mock('../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tournament/1/matches']}>
      <Routes>
        <Route path="/tournament/:tournamentId/matches" element={<MatchesPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('MatchesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el título Matches', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Matches')).toBeInTheDocument());
  });

  it('muestra mensaje cuando no hay partidos', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No hay partidos creados aún')).toBeInTheDocument()
    );
  });

  it('muestra error si se selecciona el mismo equipo', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Matches'));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], '1');
    await userEvent.selectOptions(selects[1], '1');
    await userEvent.click(screen.getByRole('button', { name: '+ Crear partido' }));

    expect(screen.getByText('Los equipos deben ser diferentes.')).toBeInTheDocument();
  });

  it('muestra error si no se seleccionan equipos', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Matches'));

    await userEvent.click(screen.getByRole('button', { name: '+ Crear partido' }));

    expect(screen.getByText('Selecciona ambos equipos.')).toBeInTheDocument();
  });

  it('muestra partidos en la tabla cuando existen', async () => {
    const { getMatchesByTournament } = await import('../api/matches');
    getMatchesByTournament.mockResolvedValueOnce([
      { id: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo B', status: 'SCHEDULED', homeScore: null, awayScore: null },
      { id: 2, homeTeamName: 'Equipo C', awayTeamName: 'Equipo D', status: 'PLAYED', homeScore: 2, awayScore: 1 },
    ]);
    renderPage();

    const tabla = await screen.findByRole('table');
    expect(within(tabla).getAllByText('Equipo A').length).toBeGreaterThan(0);
    expect(within(tabla).getByText('Equipo C')).toBeInTheDocument();
    expect(within(tabla).getByText('2 – 1')).toBeInTheDocument();
    expect(within(tabla).getByText('Programado')).toBeInTheDocument();
    expect(within(tabla).getByText('Jugado')).toBeInTheDocument();
  });

  it('muestra inputs de marcador al seleccionar partido para resultado', async () => {
    const { getMatchesByTournament } = await import('../api/matches');
    getMatchesByTournament.mockResolvedValueOnce([
      { id: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo B', status: 'CONFIRMED', homeScore: null, awayScore: null },
    ]);
    renderPage();
    await waitFor(() => screen.getByText('Matches'));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[2], '1');

    const inputs = screen.getAllByPlaceholderText('0');
    expect(inputs).toHaveLength(2);
  });

  it('muestra error si no se selecciona partido para resultado', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Matches'));

    await userEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));

    expect(screen.getByText('Selecciona un partido.')).toBeInTheDocument();
  });

  it('muestra error si faltan marcadores', async () => {
    const { getMatchesByTournament } = await import('../api/matches');
    getMatchesByTournament.mockResolvedValueOnce([
      { id: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo B', status: 'CONFIRMED', homeScore: null, awayScore: null },
    ]);
    renderPage();
    await waitFor(() => screen.getByText('Matches'));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[2], '1');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));

    expect(screen.getByText('Ingresa ambos marcadores.')).toBeInTheDocument();
  });
});