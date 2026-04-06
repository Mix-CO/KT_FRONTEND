import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TournamentsPage from './pages/TournamentsPage';
import NewTournamentPage from './pages/NewTournamentPage';
import DashboardPage from './pages/DashboardPage';
import OAuthCallback from './pages/OAuthCallback.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/new" element={<NewTournamentPage />} />
        <Route path="/tournament/:tournamentId/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;