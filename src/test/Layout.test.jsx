import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';

vi.mock('../components/layout/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('Layout', () => {
  it('renderiza el contenido hijo', () => {
    render(
      <MemoryRouter>
        <Layout>
          <p>Contenido de prueba</p>
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  it('renderiza el sidebar', () => {
    render(
      <MemoryRouter>
        <Layout><p>test</p></Layout>
      </MemoryRouter>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});