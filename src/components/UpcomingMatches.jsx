function UpcomingMatches() {
  const matches = [
    { date: "Mañana", time: "16:00", place: "Cancha 1", home: "Ingeniería", away: "Medicina" },
    { date: "Viernes", time: "14:00", place: "Cancha 3", home: "Derecho", away: "Economía" },
    { date: "Sábado", time: "10:00", place: "Estadio", home: "Agronomía", away: "Artes" },
  ];

  return (
    <div className="card">
      <h3>Próximos Partidos</h3>
      {matches.map((m, i) => (
        <div className="match" key={i}>
          {/* Fecha, hora y lugar arriba */}
          <div className="match-info">
            <p><strong>{m.date}</strong> • {m.time}</p>
            <small>{m.place}</small>
          </div>

          {/* Equipos debajo */}
          <div className="teams">
            <div className="team">
              <img src={`/logos/${m.home}.png`} alt={m.home} className="team-logo" />
              <p>{m.home}</p>
            </div>
            <span className="vs">vs</span>
            <div className="team">
              <img src={`/logos/${m.away}.png`} alt={m.away} className="team-logo" />
              <p>{m.away}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="calendar-btn">
        <button className="btn-secondary">Ver calendario</button>
      </div>
    </div>
  );
}

export default UpcomingMatches;