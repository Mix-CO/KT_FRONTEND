import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamDetailPage from '../pages/TeamDetailPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/teams', () => ({
  getTeam: vi.fn(),
}));

vi.mock('../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tournament/1/teams/1']}>
      <Routes>
        <Route path="/tournament/:tournamentId/teams/:teamId" element={<TeamDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('TeamDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra error si falla la carga', async () => {
    const { getTeam } = await import('../api/teams');
    getTeam.mockRejectedValueOnce(new Error('Error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No se pudo cargar el equipo.')).toBeInTheDocument()
    );
  });

  it('muestra datos del equipo', async () => {
    const { getTeam } = await import('../api/teams');
    getTeam.mockResolvedValueOnce({
      id: 1,
      name: 'Equipo Alpha',
      captainName: 'Juan',
      captainStudentId: '123456',
      players: ['Juan', 'Pedro', 'Carlos'],
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Equipo Alpha')).toBeInTheDocument());
    expect(screen.getAllByText('Juan').length).toBeGreaterThan(0);
    expect(screen.getByText('123456')).toBeInTheDocument();
  });

  it('muestra jugadores en la tabla', async () => {
    const { getTeam } = await import('../api/teams');
    getTeam.mockResolvedValueOnce({
      id: 1,
      name: 'Equipo Alpha',
      captainName: 'Juan',
      players: ['Juan', 'Pedro'],
    });
    renderPage();
    await waitFor(() => screen.getByText('Equipo Alpha'));
    expect(screen.getByText('Pedro')).toBeInTheDocument();
    expect(screen.getByText('Capitán')).toBeInTheDocument();
    expect(screen.getAllByText('Jugador').length).toBeGreaterThan(0);
  });

  it('muestra mensaje cuando no hay jugadores', async () => {
    const { getTeam } = await import('../api/teams');
    getTeam.mockResolvedValueOnce({
      id: 1, name: 'Equipo Alpha', captainName: 'Juan', players: [],
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No hay jugadores registrados en este equipo.')).toBeInTheDocument()
    );
  });

  it('navega de vuelta a equipos', async () => {
    const { getTeam } = await import('../api/teams');
    getTeam.mockRejectedValueOnce(new Error('Error'));
    renderPage();
    await waitFor(() => screen.getByText('← Volver a equipos'));
    await userEvent.click(screen.getByText('← Volver a equipos'));
    expect(mockNavigate).toHaveBeenCalledWith('/tournament/1/teams');
  });
});