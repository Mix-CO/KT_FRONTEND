import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const WEEK_DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const TIME_SLOTS = ['08:00 - 10:00', '12:00 - 14:00', '16:00 - 18:00', '18:00 - 20:00'];

const INITIAL_AVAILABILITY = [
  [true, false, true, false, true, true, false],
  [false, true, false, true, false, true, false],
  [true, true, true, true, true, false, false],
  [true, true, true, true, true, false, false],
];

const STAT_CARDS = [
  { value: '12', label: 'GOLES' },
  { value: '8', label: 'ASISTENCIAS' },
  { value: '24', label: 'PARTIDOS' },
  { value: '4.9', label: 'FAIR PLAY' },
];

const TEAMS = [
  {
    id: 1,
    name: 'Ingenieria FC',
    type: 'Torneo Interfacultades',
    status: 'ACTIVO',
    rank: '2DO LUGAR',
  },
  {
    id: 2,
    name: 'Los Halcones',
    type: 'Liga Regional U',
    status: 'INSCRIPCION ABIERTA',
    rank: '',
  },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    title: 'Ganaste el premio "MVP del Partido"',
    detail: 'Hace 2 dias - Ingenieria FC vs Arquitectura',
  },
  {
    id: 2,
    title: 'Marcaste un gol (Asistencia: Mateo R.)',
    detail: 'Hace 2 dias - Minuto 42',
  },
  {
    id: 3,
    title: 'Actualizaste tu disponibilidad',
    detail: 'Hace 4 dias',
  },
  {
    id: 4,
    title: 'Inscripcion confirmada: Torneo Verano',
    detail: 'Hace 1 semana',
  },
];

export default function ProfileViewPage() {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);

  const availableCount = useMemo(
    () => availability.flat().filter(Boolean).length,
    [availability],
  );

  const toggleCell = (rowIndex, colIndex) => {
    setAvailability((prev) =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          if (r === rowIndex && c === colIndex) return !cell;
          return cell;
        }),
      ),
    );
  };

  const resetAvailability = () => {
    setAvailability(INITIAL_AVAILABILITY);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
        <div className="mx-auto max-w-[1320px] space-y-5">

          <header className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 flex flex-col xl:flex-row gap-5 xl:items-center">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-green-500 bg-gradient-to-br from-orange-200 to-orange-400" />
                <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-black text-gray-900">Alex Johnson</h1>
                  <span className="rounded-full bg-green-100 text-green-700 text-xs font-bold px-3 py-1 uppercase">Capitan</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Facultad de Ingenieria | Ingenieria de Software</p>
                <p className="text-sm text-gray-500 mt-1">ID: 20230456</p>
                <p className="text-sm text-gray-500 mt-1">Campus Central, Ciudad de Mexico</p>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/profile/edit')}
                    className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 transition"
                  >
                    Editar Perfil
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 transition"
                  >
                    Compartir Perfil
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[220px]">
              {STAT_CARDS.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                  <p className="text-3xl font-black text-green-600 leading-none">{stat.value}</p>
                  <p className="text-[11px] font-bold text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </header>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
            <div className="space-y-5">
              <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Gestion de Disponibilidad</h2>
                    <p className="text-sm text-gray-500">Marca los horarios en los que puedes jugar</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetAvailability}
                    className="text-green-600 font-semibold text-sm hover:underline"
                  >
                    Resetear
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead>
                      <tr>
                        <th className="w-36" />
                        {WEEK_DAYS.map((day) => (
                          <th key={day} className="text-center py-2 text-[11px] font-bold text-gray-500 uppercase">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((slot, rowIndex) => (
                        <tr key={slot}>
                          <td className="text-xs font-semibold text-gray-400 py-2">{slot}</td>
                          {WEEK_DAYS.map((day, colIndex) => {
                            const isEnabled = availability[rowIndex][colIndex];
                            return (
                              <td key={`${day}-${slot}`} className="py-1 px-1">
                                <button
                                  type="button"
                                  onClick={() => toggleCell(rowIndex, colIndex)}
                                  className={`h-9 w-full rounded-md border transition ${
                                    isEnabled
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'bg-gray-50 border-gray-200 text-transparent hover:border-green-300'
                                  }`}
                                  aria-label={`Cambiar disponibilidad ${day} ${slot}`}
                                >
                                  ✓
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-500">Bloques disponibles: {availableCount} / {TIME_SLOTS.length * WEEK_DAYS.length}</p>
                  <button
                    type="button"
                    className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 transition"
                  >
                    Guardar Horarios
                  </button>
                </div>
              </article>

              <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
                <h2 className="text-3xl font-black text-gray-900 mb-4">Mis Equipos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TEAMS.map((team) => (
                    <button
                      type="button"
                      key={team.id}
                      className="text-left rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/30 p-4 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-gray-900">{team.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{team.type}</p>
                          <p className="text-xs font-bold text-green-600 mt-2 uppercase">{team.status}</p>
                          {team.rank && (
                            <p className="text-xs text-gray-500 mt-1">{team.rank}</p>
                          )}
                        </div>
                        <span className="text-gray-300">›</span>
                      </div>
                    </button>
                  ))}
                </div>
              </article>
            </div>

            <aside className="space-y-5">
              <article className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-2xl font-black text-gray-900">Rendimiento Ultima Temporada</h3>
                <p className="text-sm text-gray-500 mt-1">Victorias / Derrotas 75% Win Rate</p>

                <div className="space-y-4 mt-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Minutos Jugados</span>
                      <span className="font-semibold text-gray-700">1,420 min</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full w-[88%] bg-green-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Precision de Pase</span>
                      <span className="font-semibold text-gray-700">82%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full w-[82%] bg-yellow-400" />
                    </div>
                  </div>
                </div>
              </article>

              <article className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-2xl font-black text-gray-900 mb-3">Actividad Reciente</h3>
                <div className="space-y-3">
                  {RECENT_ACTIVITY.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">•</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{entry.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{entry.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-full mt-4 rounded-xl border border-gray-200 text-gray-600 font-semibold py-2.5 hover:bg-gray-50 transition"
                >
                  Ver todo el historial
                </button>
              </article>
            </aside>
          </section>

        </div>
      </div>
    </Layout>
  );
}
