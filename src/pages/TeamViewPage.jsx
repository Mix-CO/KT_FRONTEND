import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const TEAM = {
  name: 'Los Galacticos FC',
  status: 'ACTIVE',
  faculty: 'Faculty of Engineering',
  colors: 'Green & White',
  founded: '2021',
  home: 'Central Field',
};

const STATS = [
  {
    title: 'Goles Marcados',
    value: '24',
    hint: '+3 since last week',
  },
  {
    title: 'Partidos Ganados',
    value: '8',
    hint: 'Partidos Ganados',
  },
  {
    title: 'Rango de Torneo',
    value: '2nd',
    hint: 'Rango de Torneo',
  },
];

const PLAYERS = [
  { id: 1, name: 'Carlos Hernandez', position: 'ST', goals: 12 },
  { id: 2, name: 'David Silva', position: 'CM', goals: 4 },
  { id: 3, name: 'Marco Rossi', position: 'CB', goals: 1 },
  { id: 4, name: 'Lucas Viana', position: 'GK', goals: 0 },
];

const MATCHES = [
  {
    id: 1,
    round: 'LEAGUE ROUND 11',
    home: 'Galacticos',
    away: 'The Titans',
    time: '18:30 PM',
    venue: 'Main Stadium, Field 2',
  },
  {
    id: 2,
    round: 'LEAGUE ROUND 12',
    home: 'Galacticos',
    away: 'Blue Wings',
    time: '20:00 PM',
    venue: 'North Sports Center',
  },
];

const POSITION_COLORS = {
  ST: 'bg-orange-100 text-orange-700',
  CM: 'bg-blue-100 text-blue-700',
  CB: 'bg-emerald-100 text-emerald-700',
  GK: 'bg-amber-100 text-amber-700',
};

export default function TeamViewPage() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();

  const totalGoals = useMemo(
    () => PLAYERS.reduce((acc, player) => acc + player.goals, 0),
    [],
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
        <div className="mx-auto max-w-[1300px] space-y-5">

          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
              <div className="h-24 w-24 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-bold">
                TEAM
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black text-gray-900">{TEAM.name}</h1>
                  <span className="inline-flex items-center rounded-full bg-green-500 text-white text-xs font-bold px-3 py-1">
                    {TEAM.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">{TEAM.faculty}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                  <span>{TEAM.colors}</span>
                  <span>Founded: {TEAM.founded}</span>
                  <span>Home: {TEAM.home}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/tournament/${tournamentId}/teams/new`)}
                  className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 transition"
                >
                  Editar Equipo
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
                  aria-label="Compartir"
                >
                  ↗
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 px-5 lg:px-6">
              <div className="flex items-center gap-7 text-sm font-semibold text-gray-500">
                <button type="button" className="py-3">Overview</button>
                <button type="button" className="py-3 text-green-600 border-b-2 border-green-500">Roster</button>
                <button type="button" className="py-3">Schedule</button>
                <button type="button" className="py-3">Statistics</button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <article key={stat.title} className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-400">{stat.title}</p>
                <p className="text-4xl font-black text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-green-500 mt-2">{stat.hint}</p>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
            <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black text-gray-900">Plantilla del Equipo</h2>
                <button
                  type="button"
                  onClick={() => navigate(`/tournament/${tournamentId}/teams/new`)}
                  className="text-green-600 font-bold text-sm hover:underline"
                >
                  Anadir Jugador
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3">Jugador</th>
                      <th className="text-left px-4 py-3">Posicion</th>
                      <th className="text-left px-4 py-3">Goles</th>
                      <th className="text-left px-4 py-3">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAYERS.map((player) => (
                      <tr key={player.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                            <span className="font-semibold text-gray-800">{player.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-bold uppercase ${POSITION_COLORS[player.position]}`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800">{player.goals}</td>
                        <td className="px-4 py-3 text-gray-400">⋮</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-gray-500">Total de goles del plantel: {totalGoals}</p>
            </article>

            <aside className="space-y-4">
              <article className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-black text-gray-900">Proximos Partidos</h3>
                  <button type="button" className="text-gray-400 hover:text-gray-600">→</button>
                </div>

                <div className="space-y-3">
                  {MATCHES.map((match) => (
                    <div key={match.id} className="rounded-xl border border-gray-200 p-3">
                      <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide">{match.round}</p>
                      <div className="mt-2 flex items-center justify-between text-sm font-semibold text-gray-800">
                        <span>{match.home}</span>
                        <span className="text-gray-400 text-xs">VS {match.time}</span>
                        <span>{match.away}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{match.venue}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-xl font-black text-gray-900 mb-3">Resultado Reciente</h3>
                <div className="rounded-xl border-l-4 border-green-500 bg-gray-50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Victoria · 2 days ago</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">Los Galacticos 3 - 1 Phoenix FC</p>
                </div>
              </article>
            </aside>
          </section>

        </div>
      </div>
    </Layout>
  );
}
