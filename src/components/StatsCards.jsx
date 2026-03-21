function StatsCards() {
  const stats = [
    { label: "Goleador", player: "Carlos Ruiz", value: "12 Goles", team: "Ingeniería FC" },
    { label: "Asistencias", player: "Luis Perea", value: "8 Asistencias", team: "Medicina United" },
    { label: "Valla menos vencida", player: "Mateo Silva", value: "6 Arcos en 0", team: "Ingeniería FC" },
  ];

  return (
    <div className="stats">
      {stats.map((s, i) => (
        <div className="card stat-card" key={i}>
          <p>{s.label}</p>
          <strong>{s.player}</strong>
          <p className="gray">{s.value} - {s.team}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;