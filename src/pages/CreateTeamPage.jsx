import { useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';

const FACULTIES = [
  'Ingenieria',
  'Arquitectura',
  'Medicina',
  'Derecho',
  'Economia',
  'Humanidades',
];

const POSITIONS = ['Arquero', 'Defensa', 'Mediocentro', 'Delantero'];

export default function CreateTeamPage() {
  const [form, setForm] = useState({
    teamName: '',
    faculty: '',
    primaryColor: '#13EC13',
    secondaryColor: '#182210',
    captainName: 'Carlos Mendez',
    captainId: '202300458',
  });

  const [players, setPlayers] = useState([
    {
      id: 'cmendez@univ.edu',
      name: 'Carlos Mendez (C)',
      position: 'Mediocentro',
      locked: true,
    },
    {
      id: 'jgarcia@univ.edu',
      name: 'Juan Garcia',
      position: 'Arquero',
      locked: false,
    },
  ]);

  const [playerCounter, setPlayerCounter] = useState(3);

  const rosterTarget = 12;
  const canRegister = players.length >= 7;

  const normalizedTeamName = useMemo(
    () => form.teamName.trim() || 'Nombre del Equipo',
    [form.teamName],
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPlayer = () => {
    if (players.length >= rosterTarget) return;

    const generatedPosition = POSITIONS[playerCounter % POSITIONS.length];
    const generatedName = `Jugador ${playerCounter}`;
    const generatedEmail = `jugador${playerCounter}@univ.edu`;

    setPlayers((prev) => [
      ...prev,
      {
        id: generatedEmail,
        name: generatedName,
        position: generatedPosition,
        locked: false,
      },
    ]);
    setPlayerCounter((prev) => prev + 1);
  };

  const handleRemovePlayer = (playerId) => {
    setPlayers((prev) => prev.filter((player) => player.id !== playerId));
  };

  const positionBadgeClass = (position) => {
    if (position === 'Arquero') return 'bg-orange-100 text-orange-700';
    if (position === 'Mediocentro') return 'bg-blue-100 text-blue-700';
    if (position === 'Defensa') return 'bg-emerald-100 text-emerald-700';
    return 'bg-violet-100 text-violet-700';
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-6 lg:p-8">
        <div className="mx-auto max-w-[1300px] grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

          <section className="space-y-6">
            <header>
              <h1 className="text-3xl font-extrabold text-gray-900">Crear Nuevo Equipo</h1>
              <p className="text-gray-500 mt-1">
                Configura los detalles de tu escuadra para la proxima temporada.
              </p>
            </header>

            <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Informacion Basica</h2>

                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Nombre del Equipo
                  </label>
                  <input
                    type="text"
                    value={form.teamName}
                    onChange={(e) => handleChange('teamName', e.target.value)}
                    placeholder="Ej. Los Galacticos FC"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500"
                  />

                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1 mt-4">
                    Facultad
                  </label>
                  <select
                    value={form.faculty}
                    onChange={(e) => handleChange('faculty', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500"
                  >
                    <option value="">Selecciona una facultad</option>
                    {FACULTIES.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Identidad Visual</h2>

                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Escudo
                  </label>
                  <button
                    type="button"
                    className="w-full border border-dashed border-green-300 rounded-xl p-6 text-sm font-semibold text-green-600 hover:bg-green-50 transition"
                  >
                    Subir Logo
                  </button>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">
                        Primario
                      </label>
                      <div className="h-10 rounded-lg border border-gray-200 flex items-center overflow-hidden">
                        <input
                          type="color"
                          value={form.primaryColor}
                          onChange={(e) => handleChange('primaryColor', e.target.value)}
                          className="h-full w-11 cursor-pointer border-0 bg-transparent"
                        />
                        <span className="px-2 text-xs font-semibold text-gray-500">{form.primaryColor.toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">
                        Secundario
                      </label>
                      <div className="h-10 rounded-lg border border-gray-200 flex items-center overflow-hidden">
                        <input
                          type="color"
                          value={form.secondaryColor}
                          onChange={(e) => handleChange('secondaryColor', e.target.value)}
                          className="h-full w-11 cursor-pointer border-0 bg-transparent"
                        />
                        <span className="px-2 text-xs font-semibold text-gray-500">{form.secondaryColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Datos del Capitan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={form.captainName}
                    onChange={(e) => handleChange('captainName', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    ID Universitario
                  </label>
                  <input
                    type="text"
                    value={form.captainId}
                    onChange={(e) => handleChange('captainId', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500"
                  />
                </div>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Lista de Jugadores</h2>
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  disabled={players.length >= rosterTarget}
                  className="rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 transition"
                >
                  + Anadir Jugador
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3">ID / Email</th>
                      <th className="text-left px-4 py-3">Nombre</th>
                      <th className="text-left px-4 py-3">Posicion</th>
                      <th className="text-left px-4 py-3">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-600">{player.id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{player.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase ${positionBadgeClass(player.position)}`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={player.locked}
                            onClick={() => handleRemovePlayer(player.id)}
                            className="text-red-500 hover:text-red-700 disabled:text-gray-300 transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}

                    {players.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center px-4 py-8 text-gray-400 text-xs">
                          No hay jugadores anadidos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm sticky top-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Vista Previa</p>
              </div>

              <div className="p-4">
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: `linear-gradient(140deg, ${form.primaryColor} 0%, ${form.secondaryColor} 100%)` }}
                >
                  <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center mx-auto text-gray-700 font-black">
                    KT
                  </div>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">Nuevo Equipo</p>
                <h3 className="text-xl font-extrabold text-gray-900 mt-1">{normalizedTeamName}</h3>
                <p className="text-sm text-gray-500 mt-1">{form.faculty || 'Facultad Seleccionada'}</p>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">Capitan</p>
                    <p className="text-sm font-semibold text-gray-800">{form.captainName || 'Sin asignar'}</p>
                  </div>
                  <div className={`h-5 w-10 rounded-full relative ${canRegister ? 'bg-green-200' : 'bg-gray-200'}`}>
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full transition ${canRegister ? 'left-5 bg-green-500' : 'left-0.5 bg-gray-400'}`}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>Plantilla Completa</span>
                    <span className="text-green-600">{players.length} / {rosterTarget}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(players.length / rosterTarget) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Minimo 7 jugadores para registrar el equipo en el torneo oficial.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canRegister}
                  className="w-full mt-6 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-extrabold py-3 transition"
                >
                  Registrar Equipo
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </Layout>
  );
}
