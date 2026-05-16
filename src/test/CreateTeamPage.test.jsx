import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CreateTeamPage from '../pages/CreateTeamPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/teams', () => ({
  createTeam: vi.fn(),
  addPlayerToTeam: vi.fn(),
}));

vi.mock('../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tournament/1/teams/new']}>
      <Routes>
        <Route path="/tournament/:tournamentId/teams/new" element={<CreateTeamPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('CreateTeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('activeTournament', JSON.stringify({
      id: 1, minPlayersPerTeam: 2, maxPlayersPerTeam: 5,
    }));
  });

  it('renderiza el formulario', () => {
    renderPage();
    expect(screen.getByText('Crear Nuevo Equipo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Los Galácticos FC')).toBeInTheDocument();
  });

  it('navega de vuelta al hacer click en volver', async () => {
    renderPage();
    await userEvent.click(screen.getByText('← Volver a equipos'));
    expect(mockNavigate).toHaveBeenCalledWith('/tournament/1/teams');
  });

  it('añade un jugador al hacer click en añadir', async () => {
    renderPage();
    const initialCount = screen.getAllByText(/Jugador \d+/).length;
    await userEvent.click(screen.getByRole('button', { name: '+ Añadir Jugador' }));
    expect(screen.getAllByText(/Jugador \d+/).length).toBe(initialCount + 1);
  });

  it('elimina un jugador', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '+ Añadir Jugador' }));
    const initialCount = screen.getAllByText(/Jugador \d+/).length;
    const eliminarBtns = screen.getAllByText('Eliminar');
    await userEvent.click(eliminarBtns[0]);
    expect(screen.getAllByText(/Jugador \d+/).length).toBe(initialCount - 1);
  });

  it('muestra error si jugador sin nombre o email al enviar', async () => {
    localStorage.setItem('token',
      'eyJhbGciOiJIUzI1NiJ9.' +
      btoa(JSON.stringify({ userId: 1, role: 'CAPTAIN' })) +
      '.sig'
    );
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Ej. Los Galácticos FC'), 'Mi Equipo');
    await userEvent.click(screen.getByRole('button', { name: /añadir jugador/i }));
    await userEvent.click(screen.getByRole('button', { name: /registrar equipo/i }));
    await waitFor(() =>
      expect(screen.getByText('Todos los jugadores deben tener nombre y email.')).toBeInTheDocument()
    );
  });

  it('muestra error si no hay sesión', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Ej. Los Galácticos FC'), 'Mi Equipo');
    // Añadir segundo jugador para cumplir el mínimo de 2
    await userEvent.click(screen.getByRole('button', { name: '+ Añadir Jugador' }));
    await userEvent.click(screen.getByRole('button', { name: /registrar equipo/i }));
    await waitFor(() =>
      expect(screen.getByText('No se pudo obtener tu sesión. Por favor vuelve a iniciar sesión.')).toBeInTheDocument()
    );
  });

  it('muestra vista previa con nombre del equipo', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Ej. Los Galácticos FC'), 'Los Cracks');
    await waitFor(() =>
      expect(screen.getByText('Los Cracks')).toBeInTheDocument()
    );
  });
});