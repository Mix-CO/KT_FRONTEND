import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getTournament } from '../api/tournaments';
import { getStandingsByTournament } from '../api/standings';
import { getMatchesByTournament } from '../api/matches';

export default function StandingsPage() {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, s, m] = await Promise.all([
          getTournament(tournamentId),
          getStandingsByTournament(tournamentId),
          getMatchesByTournament(tournamentId),
        ]);
        setTournament(t);
        setStandings(s);
        setMatches(m);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [tournamentId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full p-20">
          <p className="text-gray-400 animate-pulse">Loading standings...</p>
        </div>
      </Layout>
    );
  }

  const playedMatches = matches.filter((m) => m.status === 'PLAYED');

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Standings</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name} · {tournament?.semester}</p>
        </div>

        {/* Standings table */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">Tabla de posiciones</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-100">
                <th className="text-left pb-3 pr-4">#</th>
                <th className="text-left pb-3">EQUIPO</th>
                <th className="text-center pb-3 px-2">PJ</th>
                <th className="text-center pb-3 px-2">G</th>
                <th className="text-center pb-3 px-2">E</th>
                <th className="text-center pb-3 px-2">P</th>
                <th className="text-center pb-3 px-2">GF</th>
                <th className="text-center pb-3 px-2">GC</th>
                <th className="text-center pb-3 px-2">DG</th>
                <th className="text-center pb-3 px-2">PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, index) => {
                const goalDiff = s.goalsFor - s.goalsAgainst;
                const isTop = index === 0;
                return (
                  <tr
                    key={s.id}
                    className={`border-t border-gray-50 ${isTop ? 'bg-green-50' : ''}`}
                  >
                    <td className="py-3 pr-4">
                      {isTop ? (
                        <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          1
                        </span>
                      ) : (
                        <span className="text-gray-400">{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3 font-semibold text-gray-800">{s.teamName}</td>
                    <td className="py-3 text-center text-gray-600 px-2">{s.played}</td>
                    <td className="py-3 text-center text-gray-600 px-2">{s.wins}</td>
                    <td className="py-3 text-center text-gray-600 px-2">{s.draws}</td>
                    <td className="py-3 text-center text-gray-600 px-2">{s.losses}</td>
                    <td className="py-3 text-center text-gray-600 px-2">{s.goalsFor}</td>
                    <td className="py-3 text-center text-gray-600 px-2">{s.goalsAgainst}</td>
                    <td className={`py-3 text-center px-2 font-medium ${goalDiff > 0 ? 'text-green-500' : goalDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                    </td>
                    <td className="py-3 text-center font-bold text-green-500 px-2">{s.points}</td>
                  </tr>
                );
              })}
              {standings.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400 text-sm">
                    No hay equipos en la tabla aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Resultados recientes</h2>
          {playedMatches.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No hay resultados aún</p>
          ) : (
            <div className="flex flex-col gap-3">
              {playedMatches.map((match) => (
                <div key={match.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 w-1/3 text-right">{match.homeTeamName}</span>
                    <span className="font-bold text-gray-900 text-xl mx-4">
                      {match.homeScore} – {match.awayScore}
                    </span>
                    <span className="font-semibold text-gray-800 w-1/3">{match.awayTeamName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}