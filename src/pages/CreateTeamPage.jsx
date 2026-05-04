import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { createTeam, addPlayerToTeam } from '../api/teams';

function getUserIdFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1])).userId;
  } catch {
    return null;
  }
}

const EMPTY_PLAYER = { name: '', studentId: '', email: '' };

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();

  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState([{ ...EMPTY_PLAYER }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const normalizedTeamName = useMemo(
    () => teamName.trim() || 'Nombre del Equipo',
    [teamName],
  );

  const activeTournament = JSON.parse(localStorage.getItem('activeTournament') || '{}');
  const minPlayers = activeTournament?.minPlayersPerTeam ?? 7;
  const maxPlayers = activeTournament?.maxPlayersPerTeam ?? 12;

  const canSubmit = teamName.trim().length > 0 && players.length >= minPlayers;

  const handlePlayerChange = (idx, field, value) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    );
  };

  const handleAddPlayer = () => {
    if (players.length >= maxPlayers) return;
    setPlayers((prev) => [...prev, { ...EMPTY_PLAYER }]);
  };

  const handleRemovePlayer = (idx) => {
    if (players.length <= 1) return;
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setError(null);
    const creatorUserId = getUserIdFromToken();
    if (!creatorUserId) {
      setError('No se pudo obtener tu sesión. Por favor vuelve a iniciar sesión.');
      return;
    }

    // Validar que los jugadores tengan al menos nombre y email
    const invalidPlayer = players.find((p) => !p.name.trim() || !p.email.trim());
    if (invalidPlayer) {
      setError('Todos los jugadores deben tener nombre y email.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: teamName.trim(),
        logoUrl: null,
        captainStudentId: null,
        tournamentId: Number(tournamentId),
        players: players.map((p) => ({
          name: p.name.trim(),
          studentId: p.studentId.trim() || null,
          email: p.email.trim(),
        })),
      };

      await createTeam(payload, creatorUserId);
      navigate(`/tournament/${tournamentId}/teams`);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'Error al crear el equipo.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-6 lg:p-8">
        <div className="mx-auto max-w-[1100px] grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

          <section className="space-y-6">
            <header>
              <button
                type="button"
                onClick={() => navigate(`/tournament/${tournamentId}/teams`)}
                className="text-sm text-gray-400 hover:text-gray-700 font-semibold transition mb-3 flex items-center gap-1"
              >
                ← Volver a equipos
              </button>
              <h1 className="text-3xl font-extrabold text-gray-900">Crear Nuevo Equipo</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Registra tu equipo para el torneo. Tú serás asignado automáticamente como capitán.
              </p>
            </header>

            {/* Error global */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
                {error}
              </div>
            )}

            {/* Nombre del equipo */}
            <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información Básica</h2>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                Nombre del Equipo
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ej. Los Galácticos FC"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500"
              />
            </article>

            {/* Jugadores */}
            <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Jugadores</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Mínimo {minPlayers} · Máximo {maxPlayers}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  disabled={players.length >= maxPlayers}
                  className="rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-bold px-4 py-2 transition"
                >
                  + Añadir Jugador
                </button>
              </div>

              <div className="space-y-3">
                {players.map((player, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-200 p-4 bg-gray-50/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Jugador {idx + 1}
                      </span>
                      {players.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(idx)}
                          className="text-xs text-red-400 hover:text-red-600 font-semibold transition"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                          Nombre <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                          placeholder="Nombre completo"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={player.email}
                          onChange={(e) => handlePlayerChange(idx, 'email', e.target.value)}
                          placeholder="correo@universidad.edu"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                          ID Universitario
                        </label>
                        <input
                          type="text"
                          value={player.studentId}
                          onChange={(e) => handlePlayerChange(idx, 'studentId', e.target.value)}
                          placeholder="Ej. 202300458"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Sidebar de preview */}
          <aside>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm sticky top-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Vista Previa</p>
              </div>

              <div className="p-4">
                <div className="rounded-xl bg-gradient-to-br from-green-400 to-green-700 p-4 mb-4 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center text-green-700 font-black text-xl">
                    {teamName.trim().charAt(0) || '?'}
                  </div>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">Nuevo Equipo</p>
                <h3 className="text-xl font-extrabold text-gray-900 mt-1">{normalizedTeamName}</h3>

                <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">Tú eres el Capitán</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">Asignado automáticamente</p>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>Jugadores</span>
                    <span className={players.length >= minPlayers ? 'text-green-600' : 'text-amber-500'}>
                      {players.length} / {maxPlayers}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${Math.min((players.length / maxPlayers) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {players.length < minPlayers
                      ? `Faltan ${minPlayers - players.length} jugador${minPlayers - players.length !== 1 ? 'es' : ''} para el mínimo.`
                      : '✓ Listo para registrar.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canSubmit || submitting}
                  onClick={handleSubmit}
                  className="w-full mt-6 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-green-200 disabled:cursor-not-allowed text-white font-extrabold py-3 transition"
                >
                  {submitting ? 'Registrando...' : 'Registrar Equipo'}
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </Layout>
  );
}
