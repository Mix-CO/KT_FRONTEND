import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getTeamsByTournament } from '../api/teams';

function getUserIdFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1])).userId;
  } catch {
    return null;
  }
}

function getUserNameFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1])).name || null;
  } catch {
    return null;
  }
}

export default function TeamViewPage() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserName = getUserNameFromToken();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await getTeamsByTournament(tournamentId);
        setTeams(data);
      } catch (err) {
        setError('No se pudieron cargar los equipos del torneo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [tournamentId]);

  const myTeam = teams.find((t) => t.captainName === currentUserName);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
        <div className="mx-auto max-w-[1100px] space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Equipos</h1>
              <p className="text-sm text-gray-500 mt-1">
                {teams.length} equipo{teams.length !== 1 ? 's' : ''} registrado{teams.length !== 1 ? 's' : ''} en el torneo
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/tournament/${tournamentId}/teams/new`)}
              className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 transition text-sm"
            >
              + Crear Equipo
            </button>
          </div>

          {/* Mi equipo shortcut */}
          {myTeam && (
            <div
              className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-green-100 transition"
              onClick={() => navigate(`/tournament/${tournamentId}/teams/${myTeam.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center text-white font-black text-sm">
                  {myTeam.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Mi Equipo</p>
                  <p className="font-bold text-gray-900">{myTeam.name}</p>
                </div>
              </div>
              <span className="text-green-500 font-bold text-lg">→</span>
            </div>
          )}

          {/* Estado de carga / error */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 font-semibold">Cargando equipos...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Lista de equipos */}
          {!loading && !error && teams.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-bold text-gray-700">No hay equipos registrados aún</p>
              <p className="text-sm text-gray-400 mt-1">Sé el primero en crear un equipo para este torneo.</p>
            </div>
          )}

          {!loading && !error && teams.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3">Equipo</th>
                      <th className="text-left px-5 py-3">Capitán</th>
                      <th className="text-left px-5 py-3">Jugadores</th>
                      <th className="text-left px-5 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => (
                      <tr
                        key={team.id}
                        className={`border-t border-gray-100 hover:bg-gray-50 transition ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-black text-sm flex-shrink-0">
                              {team.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-900">{team.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{team.captainName || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1">
                            👤 {team.players?.length ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => navigate(`/tournament/${tournamentId}/teams/${team.id}`)}
                            className="rounded-lg border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 text-xs font-bold px-3 py-1.5 transition"
                          >
                            Ver →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}