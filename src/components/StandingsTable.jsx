function StandingsTable() {
  const teams = [
    { pos: 1, name: "Ingeniería FC", logo: "../assets/test_logo.png", pj: 10, g: 8, e: 1, p: 1, gf: 25, gc: 10, pts: 25 },
    { pos: 2, name: "Medicina United", logo: "../assets/test_logo.png", pj: 10, g: 7, e: 2, p: 1, gf: 20, gc: 12, pts: 23 },
    // ...
  ];

  return (
    <div className="card">
      <h3>Tabla General</h3>
      <table>
        <thead>
          <tr>
            <th>Pos</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF/GC</th><th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.pos}>
              <td>{team.pos}</td>
              <td>
                <img src={team.logo} alt={team.name} className="team-logo" />
                {team.name}
              </td>
              <td>{team.pj}</td><td>{team.g}</td><td>{team.e}</td><td>{team.p}</td>
              <td>{team.gf}/{team.gc}</td><td>{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StandingsTable;