import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getTournament, getTeamsInTournament } from '../api/tournaments';
import { getMatchesByTournament } from '../api/matches';
import { getStandingsByTournament } from '../api/standings';
import { getAiSuggestion } from '../api/ai';

const STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  PLAYED: 'Played',
  CANCELLED: 'Cancelled',
};

const DAY_LABELS = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export default function DashboardPage() {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, m, s, te] = await Promise.all([
          getTournament(tournamentId),
          getMatchesByTournament(tournamentId),
          getStandingsByTournament(tournamentId),
          getTeamsInTournament(tournamentId),
        ]);
        setTournament(t);
        setMatches(m);
        setStandings(s);
        setTeams(te);

        const firstScheduled = m.find((match) => match.status === 'SCHEDULED');
        if (firstScheduled) {
          try {
            const suggestion = await getAiSuggestion(firstScheduled.id);
            setAiSuggestion(suggestion);
          } catch (e) {
            console.error('Error obteniendo sugerencia IA:', e);
          }
        }
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
          <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  const pendingMatches = matches.filter((m) => m.status === 'SCHEDULED').length;
  const playedMatches = matches.filter((m) => m.status === 'PLAYED');
  const nextMatch = matches.find((m) => m.status === 'CONFIRMED');

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name} · {tournament?.semester}</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-gray-400 text-sm mb-1">Active Teams</p>
            <p className="text-3xl font-bold text-gray-900">{String(teams.length).padStart(2, '0')}</p>
            <p className="text-green-500 text-xs mt-2">↑ registered in tournament</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-gray-400 text-sm mb-1">Pending Matches</p>
            <p className="text-3xl font-bold text-gray-900">{String(pendingMatches).padStart(2, '0')}</p>
            {pendingMatches > 0 && (
              <p className="text-yellow-500 text-xs mt-2">Requires action</p>
            )}
          </div>

          <div className="bg-green-500 rounded-2xl p-5 text-white">
            <p className="text-green-100 text-sm mb-1">Next Game</p>
            {nextMatch ? (
              <>
                <p className="text-2xl font-bold">
                  {nextMatch.homeTeamName} vs {nextMatch.awayTeamName}
                </p>
                <span className="bg-white text-green-600 text-xs font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                  Confirmed
                </span>
              </>
            ) : (
              <p className="text-green-100 text-sm">No upcoming matches</p>
            )}
          </div>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion ? (
          <div className="bg-green-500 rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-xl p-3">
                <span className="text-white text-xl">📅</span>
              </div>
              <div>
                <p className="text-white font-bold">
                  IA Sugiere: {aiSuggestion.homeTeamName} vs {aiSuggestion.awayTeamName}
                </p>
                <p className="text-green-100 text-sm mt-0.5">
                  {aiSuggestion.explanation}
                </p>
                <p className="text-white text-xs font-semibold mt-1">
                  📆 {DAY_LABELS[aiSuggestion.dayOfWeek] ?? aiSuggestion.dayOfWeek} · {aiSuggestion.startTime} – {aiSuggestion.endTime}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="bg-gray-200 rounded-xl p-3">
              <span className="text-gray-400 text-xl">📅</span>
            </div>
            <div>
              <p className="text-gray-500 font-bold">Sin sugerencia de IA disponible</p>
              <p className="text-gray-400 text-sm mt-0.5">
                No hay partidos pendientes de programar en este torneo.
              </p>
            </div>
          </div>
        )}

        {/* Bottom grid */}
        <div className="grid grid-cols-2 gap-6">

          {/* Live Standings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Live Standings</h2>
              <button className="text-green-500 text-sm font-semibold hover:underline">
                View All
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-left pb-2">POS</th>
                  <th className="text-left pb-2">TEAM</th>
                  <th className="text-center pb-2">P</th>
                  <th className="text-center pb-2">W</th>
                  <th className="text-center pb-2">D</th>
                  <th className="text-center pb-2">L</th>
                  <th className="text-center pb-2">PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.slice(0, 5).map((s, index) => (
                  <tr key={s.id} className="border-t border-gray-50">
                    <td className="py-2.5 text-gray-400">{index + 1}</td>
                    <td className="py-2.5 font-semibold text-gray-800">{s.teamName}</td>
                    <td className="py-2.5 text-center text-gray-600">{s.played}</td>
                    <td className="py-2.5 text-center text-gray-600">{s.wins}</td>
                    <td className="py-2.5 text-center text-gray-600">{s.draws}</td>
                    <td className="py-2.5 text-center text-gray-600">{s.losses}</td>
                    <td className="py-2.5 text-center font-bold text-green-500">{s.points}</td>
                  </tr>
                ))}
                {standings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-400 text-xs">
                      No standings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Match Results */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Match Results</h2>
            </div>
            <div className="flex flex-col gap-3">
              {playedMatches.slice(0, 4).map((match) => (
                <div key={match.id} className="border border-gray-100 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">
                    {tournament?.name} · Played
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{match.homeTeamName}</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <span className="font-semibold text-gray-800">{match.awayTeamName}</span>
                  </div>
                </div>
              ))}
              {playedMatches.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No results yet</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}