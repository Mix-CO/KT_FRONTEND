import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ tournamentId: '1' }) };
});

const renderSidebar = () =>
  render(<MemoryRouter><Sidebar /></MemoryRouter>);

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('activeTournament', JSON.stringify({ id: 1, name: 'Liga Test' }));
  });

  it('muestra el nombre del torneo activo', () => {
    renderSidebar();
    expect(screen.getByText('Liga Test')).toBeInTheDocument();
  });

  it('muestra todos los items de navegación', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Matches')).toBeInTheDocument();
    expect(screen.getByText('Standings')).toBeInTheDocument();
    expect(screen.getByText('Scheduling')).toBeInTheDocument();
  });

  it('navega al dashboard al hacer click', async () => {
    renderSidebar();
    await userEvent.click(screen.getByText('Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/tournament/1/dashboard');
  });

  it('navega al perfil al hacer click en Perfil', async () => {
    renderSidebar();
    await userEvent.click(screen.getByText('Perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('cierra sesión y navega a login', async () => {
    localStorage.setItem('token', 'fake-token');
    renderSidebar();
    await userEvent.click(screen.getByText('Cerrar sesión'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('activeTournament')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});