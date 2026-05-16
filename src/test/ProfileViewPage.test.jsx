import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProfileViewPage from '../pages/ProfileViewPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/timeslots', () => ({
  getAllTimeSlots: vi.fn(),
}));

vi.mock('../api/availability', () => ({
  getUserAvailability: vi.fn(),
  createAvailability: vi.fn(),
  deleteAvailability: vi.fn(),
}));

vi.mock('../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const FAKE_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ userId: 42, name: 'Juan Test', role: 'CAPTAIN', sub: 'juan@uni.edu' })) +
  '.sig';

const renderPage = () =>
  render(<MemoryRouter><ProfileViewPage /></MemoryRouter>);

describe('ProfileViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra cargando disponibilidad si no hay token', async () => {
    const { getAllTimeSlots } = await import('../api/timeslots');
    getAllTimeSlots.mockResolvedValueOnce([]);
    renderPage();
    expect(screen.getByText('Disponibilidad Semanal')).toBeInTheDocument();
  });

  it('muestra nombre del usuario desde el token', async () => {
    localStorage.setItem('token', FAKE_TOKEN);
    const { getAllTimeSlots } = await import('../api/timeslots');
    const { getUserAvailability } = await import('../api/availability');
    getAllTimeSlots.mockResolvedValueOnce([]);
    getUserAvailability.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Juan Test')).toBeInTheDocument());
  });

  it('muestra rol del usuario', async () => {
    localStorage.setItem('token', FAKE_TOKEN);
    const { getAllTimeSlots } = await import('../api/timeslots');
    const { getUserAvailability } = await import('../api/availability');
    getAllTimeSlots.mockResolvedValueOnce([]);
    getUserAvailability.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText('CAPTAIN')).toBeInTheDocument());
  });

  it('muestra grid de disponibilidad con timeslots', async () => {
    localStorage.setItem('token', FAKE_TOKEN);
    const { getAllTimeSlots } = await import('../api/timeslots');
    const { getUserAvailability } = await import('../api/availability');
    getAllTimeSlots.mockResolvedValueOnce([
      { id: 1, dayOfWeek: 'MONDAY', start: '07:00:00', end: '08:30:00' },
      { id: 2, dayOfWeek: 'TUESDAY', start: '07:00:00', end: '08:30:00' },
    ]);
    getUserAvailability.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText('LUN')).toBeInTheDocument());
    expect(screen.getByText('MAR')).toBeInTheDocument();
  });

  it('navega a editar perfil', async () => {
    localStorage.setItem('token', FAKE_TOKEN);
    const { getAllTimeSlots } = await import('../api/timeslots');
    const { getUserAvailability } = await import('../api/availability');
    getAllTimeSlots.mockResolvedValueOnce([]);
    getUserAvailability.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => screen.getByText('Editar Perfil'));
    await userEvent.click(screen.getByText('Editar Perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile/edit');
  });

  it('muestra contador de bloques disponibles', async () => {
    localStorage.setItem('token', FAKE_TOKEN);
    const { getAllTimeSlots } = await import('../api/timeslots');
    const { getUserAvailability } = await import('../api/availability');
    getAllTimeSlots.mockResolvedValueOnce([
      { id: 1, dayOfWeek: 'MONDAY', start: '07:00:00', end: '08:30:00' },
    ]);
    getUserAvailability.mockResolvedValueOnce([
      { id: 10, timeSlotId: 1 },
    ]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Bloques disponibles/)).toBeInTheDocument()
    );
  });

  it('toggle de disponibilidad llama a deleteAvailability si ya existe', async () => {
    localStorage.setItem('token', FAKE_TOKEN);
    const { getAllTimeSlots } = await import('../api/timeslots');
    const { getUserAvailability, deleteAvailability } = await import('../api/availability');
    getAllTimeSlots.mockResolvedValueOnce([
      { id: 1, dayOfWeek: 'MONDAY', start: '07:00:00', end: '08:30:00' },
    ]);
    getUserAvailability.mockResolvedValueOnce([
      { id: 10, timeSlotId: 1 },
    ]);
    deleteAvailability.mockResolvedValueOnce({});
    renderPage();
    await waitFor(() => screen.getByText('LUN'));
    const btn = screen.getByRole('button', { name: /LUN 07:00/i });
    await userEvent.click(btn);
    expect(deleteAvailability).toHaveBeenCalledWith(10);
  });
});