import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewTournamentPage from '../pages/NewTournamentPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/tournaments', () => ({
  createTournament: vi.fn(),
}));

const renderPage = () =>
  render(<MemoryRouter><NewTournamentPage /></MemoryRouter>);

describe('NewTournamentPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza el formulario', () => {
    renderPage();
    expect(screen.getByText('Crear Nuevo Torneo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Torneo Interfacultades 2024')).toBeInTheDocument();
  });

  it('navega a /tournaments al cancelar', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/tournaments');
  });

  it('muestra error si falla la creación', async () => {
    const { createTournament } = await import('../api/tournaments');
    createTournament.mockRejectedValueOnce(new Error('Error'));
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Guardar Borrador' }));
    await waitFor(() =>
      expect(screen.getByText('Could not create tournament. Check all fields.')).toBeInTheDocument()
    );
  });

  it('navega a /tournaments tras crear exitosamente', async () => {
    const { createTournament } = await import('../api/tournaments');
    createTournament.mockResolvedValueOnce({ id: 1 });
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Guardar Borrador' }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/tournaments'));
  });

  it('actualiza el nombre del torneo', async () => {
    renderPage();
    const input = screen.getByPlaceholderText('Torneo Interfacultades 2024');
    await userEvent.type(input, 'Liga 2026');
    expect(input).toHaveValue('Liga 2026');
  });

  it('cambia la categoría a Femenino', async () => {
    renderPage();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'FEMALE');
    expect(select).toHaveValue('FEMALE');
    expect(screen.getAllByText('Femenino').length).toBeGreaterThan(0);
  });

  it('muestra vista previa con semestre ingresado', async () => {
    renderPage();
    const inputs = screen.getAllByPlaceholderText('2024-2');
    await userEvent.type(inputs[0], '2026-1');
    await waitFor(() =>
      expect(screen.getAllByText('2026-1').length).toBeGreaterThan(0)
    );
  });
});