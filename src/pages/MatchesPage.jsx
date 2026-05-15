import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getTournament } from '../api/tournaments';
import { getMatchesByTournament, createMatch, recordMatchResult } from '../api/matches';
import { getTeamsByTournament } from '../api/teams';

const STATUS_LABELS = {
  SCHEDULED: { label: 'Programado', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  PLAYED: { label: 'Jugado', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function MatchesPage() {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form: crear partido
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Form: registrar resultado
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [resultError, setResultError] = useState('');
  const [resultLoading, setResultLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [t, m, te] = await Promise.all([
        getTournament(tournamentId),
        getMatchesByTournament(tournamentId),
        getTeamsByTournament(tournamentId),
      ]);
      setTournament(t);
      setMatches(m);
      setTeams(te);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const handleCreateMatch = async () => {
    setCreateError('');
    if (!homeTeamId || !awayTeamId) {
      setCreateError('Selecciona ambos equipos.');
      return;
    }
    if (homeTeamId === awayTeamId) {
      setCreateError('Los equipos deben ser diferentes.');
      return;
    }
    setCreateLoading(true);
    try {
      await createMatch({
        homeTeamId: Number(homeTeamId),
        awayTeamId: Number(awayTeamId),
        tournamentId: Number(tournamentId),
      });
      setHomeTeamId('');
      setAwayTeamId('');
      await fetchData();
    } catch (e) {
      setCreateError('Error al crear el partido.');
      console.error(e);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRecordResult = async () => {
    setResultError('');
    if (!selectedMatchId) {
      setResultError('Selecciona un partido.');
      return;
    }
    if (homeScore === '' || awayScore === '') {
      setResultError('Ingresa ambos marcadores.');
      return;
    }
    setResultLoading(true);
    try {
      await recordMatchResult(Number(selectedMatchId), {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      });
      setSelectedMatchId('');
      setHomeScore('');
      setAwayScore('');
      await fetchData();
    } catch (e) {
      setResultError('Error al registrar el resultado.');
      console.error(e);
    } finally {
      setResultLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full p-20">
          <p className="text-gray-400 animate-pulse">Loading matches...</p>
        </div>
      </Layout>
    );
  }

  const confirmableMatches = matches.filter((m) => m.status === 'CONFIRMED' || m.status === 'SCHEDULED');

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name} · {tournament?.semester}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">

          {/* Crear partido */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Crear partido</h2>
            <p className="text-gray-400 text-xs mb-4">
              El partido quedará en estado <span className="font-semibold text-yellow-600">Programado</span> y aparecerá en la sesión de Scheduling.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Equipo local</label>
                <select
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Seleccionar equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Equipo visitante</label>
                <select
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Seleccionar equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {createError && (
                <p className="text-red-500 text-xs">{createError}</p>
              )}

              <button
                onClick={handleCreateMatch}
                disabled={createLoading}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl px-4 py-2.5 transition-all disabled:opacity-50"
              >
                {createLoading ? 'Creando...' : '+ Crear partido'}
              </button>
            </div>
          </div>

          {/* Registrar resultado */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Registrar resultado</h2>
            <p className="text-gray-400 text-xs mb-4">
              Solo partidos <span className="font-semibold text-blue-600">Confirmados</span> o <span className="font-semibold text-yellow-600">Programados</span>. Los standings se actualizan automáticamente.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Partido</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Seleccionar partido...</option>
                  {confirmableMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.homeTeamName} vs {m.awayTeamName} — {STATUS_LABELS[m.status]?.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMatchId && (() => {
                const match = matches.find((m) => m.id === Number(selectedMatchId));
                return match ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">{match.homeTeamName}</label>
                      <input
                        type="number"
                        min="0"
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-gray-400 font-bold mt-4">–</span>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">{match.awayTeamName}</label>
                      <input
                        type="number"
                        min="0"
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ) : null;
              })()}

              {resultError && (
                <p className="text-red-500 text-xs">{resultError}</p>
              )}

              <button
                onClick={handleRecordResult}
                disabled={resultLoading}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl px-4 py-2.5 transition-all disabled:opacity-50"
              >
                {resultLoading ? 'Guardando...' : 'Registrar resultado'}
              </button>
            </div>
          </div>

        </div>

        {/* Lista de todos los partidos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Todos los partidos</h2>
          {matches.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No hay partidos creados aún</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-100">
                  <th className="text-left pb-3">LOCAL</th>
                  <th className="text-center pb-3">RESULTADO</th>
                  <th className="text-right pb-3">VISITANTE</th>
                  <th className="text-center pb-3">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const statusInfo = STATUS_LABELS[match.status] || { label: match.status, color: 'bg-gray-100 text-gray-500' };
                  return (
                    <tr key={match.id} className="border-t border-gray-50">
                      <td className="py-3 font-semibold text-gray-800">{match.homeTeamName}</td>
                      <td className="py-3 text-center font-bold text-gray-900">
                        {match.status === 'PLAYED'
                          ? `${match.homeScore} – ${match.awayScore}`
                          : '–'
                        }
                      </td>
                      <td className="py-3 font-semibold text-gray-800 text-right">{match.awayTeamName}</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
}