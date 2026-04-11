import { useNavigate, useLocation, useParams } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: '⊞', path: 'dashboard' },
  { label: 'Tournaments', icon: '🏆', path: 'tournaments-detail' },
  { label: 'Schedules', icon: '📅', path: 'schedules' },
  { label: 'Teams', icon: '👥', path: 'teams' },
  { label: 'Standings', icon: '📊', path: 'standings' },
  { label: 'Perfil', icon: '👤', path: '/profile', isGlobal: true },
  { label: 'Schedules', icon: '📅', path: 'scheduling' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();

  const activeTournament = JSON.parse(localStorage.getItem('activeTournament') || '{}');

  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col justify-between py-6 px-4">

      {/* Logo */}
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="bg-green-500 rounded-lg p-1.5">
            <span className="text-white font-bold text-sm">⚙</span>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm leading-tight">KickTime</p>
            <p className="text-gray-400 text-xs">{activeTournament.name || 'Tournament'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const fallbackTournamentId = activeTournament?.id;
            const resolvedTournamentId = tournamentId || fallbackTournamentId;
            const fullPath = item.isGlobal
              ? item.path
              : resolvedTournamentId
                ? `/tournament/${resolvedTournamentId}/${item.path}`
                : '/tournaments';
            const isActive = location.pathname.includes(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(fullPath)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-green-50 text-green-600 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('activeTournament');
          navigate('/login');
        }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <span>🚪</span>
        Cerrar sesión
      </button>
    </div>
  );
}