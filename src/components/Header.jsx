function Header({ onToggleSidebar, sidebarVisible }) {
  return (
    <div className={`header ${!sidebarVisible ? "full" : ""}`}>
      <div className="header-top">
        {/* Botón hamburguesa */}
        <button 
          className="toggle-btn"
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        <div className="header-info">
          <p className="status">EN CURSO</p>
          <h2 className="title">Torneo Interfacultades 2024</h2>
          <p className="subtitle">Sede Central: Estadio Universitario</p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary">Ver Reglamento</button>
          <button className="btn-primary">Inscribir Equipo</button>
        </div>
      </div>

      <div className="header-nav">
        <button className="nav-item">Resumen</button>
        <button className="nav-item">Calendario de Partidos</button>
        <button className="nav-item active">Tabla de Posiciones</button>
        <button className="nav-item">Estadísticas</button>
      </div>
    </div>
  );
}

export default Header;