import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getTeam } from '../api/teams';

export default function TeamDetailPage() {
  const navigate = useNavigate();
  const { tournamentId, teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await getTeam(teamId);
        setTeam(data);
      } catch (err) {
        setError('No se pudo cargar el equipo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400 font-semibold">Cargando equipo...</p>
        </div>
      </Layout>
    );
  }

  if (error || !team) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 font-bold">{error || 'Equipo no encontrado'}</p>
            <button
              onClick={() => navigate(`/tournament/${tournamentId}/teams`)}
              className="mt-4 text-sm text-green-600 font-semibold hover:underline"
            >
              ← Volver a equipos
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
        <div className="mx-auto max-w-[1100px] space-y-5">

          {/* Breadcrumb */}
          <button
            type="button"
            onClick={() => navigate(`/tournament/${tournamentId}/teams`)}
            className="text-sm text-gray-400 hover:text-gray-700 font-semibold transition flex items-center gap-1"
          >
            ← Todos los equipos
          </button>

          {/* Header del equipo */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">

              {/* Logo / inicial */}
              <div className="h-20 w-20 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center text-green-700 font-black text-3xl flex-shrink-0">
                {team.name.charAt(0)}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-black text-gray-900">{team.name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                  <span>Capitán: <span className="font-semibold text-gray-700">{team.captainName || '—'}</span></span>
                  {team.captainStudentId && (
                    <span>ID: <span className="font-semibold text-gray-700">{team.captainStudentId}</span></span>
                  )}
                  <span>{team.players?.length ?? 0} jugador{team.players?.length !== 1 ? 'es' : ''}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Plantilla */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">Plantilla del Equipo</h2>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                {team.players?.length ?? 0} jugadores
              </span>
            </div>

            {team.players && team.players.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3">#</th>
                      <th className="text-left px-4 py-3">Jugador</th>
                      <th className="text-left px-4 py-3">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.players.map((playerName, idx) => {
                      const isCaptain = playerName === team.captainName;
                      return (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0">
                                {playerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-800">{playerName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isCaptain ? (
                              <span className="inline-flex rounded-full bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1">
                                Capitán
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold px-2.5 py-1">
                                Jugador
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-400 text-sm">No hay jugadores registrados en este equipo.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </Layout>
  );
}