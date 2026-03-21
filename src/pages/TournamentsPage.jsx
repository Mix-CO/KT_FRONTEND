import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTournaments } from '../api/tournaments';

const CATEGORY_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
};

const STATUS_COLORS = {
  PLANNED: 'bg-gray-500',
  REGISTRATION_OPEN: 'bg-blue-500',
  ONGOING: 'bg-green-500',
  FINISHED: 'bg-red-500',
};

const STATUS_LABELS = {
  PLANNED: 'Planned',
  REGISTRATION_OPEN: 'Registration Open',
  ONGOING: 'Ongoing',
  FINISHED: 'Finished',
};

const EMOJI_BY_CATEGORY = {
  MALE: '⚽',
  FEMALE: '🏆',
};

export default function TournamentsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getTournaments();
        setTournaments(data);
      } catch (e) {
        setError('Could not load tournaments.');
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const handleSelect = (tournament) => {
    localStorage.setItem('activeTournament', JSON.stringify(tournament));
    navigate(`/tournament/${tournament.id}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="bg-green-500 rounded-lg p-2">
          <span className="text-white font-bold text-lg">⚙</span>
        </div>
        <span className="text-white font-bold text-2xl">KickTime</span>
      </div>

      {/* Título */}
      <h1 className="text-white text-3xl font-bold mb-2">
        Who's playing today?
      </h1>
      <p className="text-gray-400 text-sm mb-12">
        Select a tournament to continue
      </p>

      {/* Estado de carga */}
      {loading && (
        <p className="text-gray-400 text-sm">Loading tournaments...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Grid de torneos */}
      {!loading && !error && (
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl">

          {tournaments.map((tournament) => (
            <button
              key={tournament.id}
              onClick={() => handleSelect(tournament)}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              {/* Card */}
              <div className="w-36 h-36 rounded-2xl bg-gray-800 border-2 border-transparent group-hover:border-green-500 transition-all duration-200 flex flex-col items-center justify-center gap-2 group-hover:scale-105">
                <span className="text-5xl">
                  {EMOJI_BY_CATEGORY[tournament.category] || '🏟'}
                </span>
                <span className={`text-xs text-white px-2 py-0.5 rounded-full ${STATUS_COLORS[tournament.status]}`}>
                  {STATUS_LABELS[tournament.status]}
                </span>
              </div>

              {/* Nombre */}
              <p className="text-gray-300 text-sm font-semibold group-hover:text-white transition-colors max-w-36 text-center">
                {tournament.name}
              </p>
              <p className="text-gray-500 text-xs">
                {tournament.semester} · {CATEGORY_LABELS[tournament.category]}
              </p>
            </button>
          ))}

          {/* Botón crear torneo */}
          <button
            onClick={() => navigate('/tournaments/new')}
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="w-36 h-36 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-600 group-hover:border-green-500 transition-all duration-200 flex items-center justify-center group-hover:scale-105">
              <span className="text-gray-400 group-hover:text-green-500 text-5xl transition-colors">+</span>
            </div>
            <p className="text-gray-400 text-sm font-semibold group-hover:text-white transition-colors">
              New Tournament
            </p>
          </button>

        </div>
      )}

      {/* Sin torneos */}
      {!loading && !error && tournaments.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">
          No tournaments found. Create one to get started.
        </p>
      )}

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}
        className="mt-16 text-gray-500 hover:text-white text-sm transition-colors"
      >
        Sign out
      </button>

    </div>
  );
}