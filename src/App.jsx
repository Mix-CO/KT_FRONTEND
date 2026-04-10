import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TournamentsPage from './pages/TournamentsPage';
import NewTournamentPage from './pages/NewTournamentPage';
import DashboardPage from './pages/DashboardPage';
import CreateTeamPage from './pages/CreateTeamPage';
import TeamViewPage from './pages/TeamViewPage';
import EditProfilePage from './pages/EditProfilePage';
import ProfileViewPage from './pages/ProfileViewPage';
import OAuthCallback from './pages/OAuthCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/new" element={<NewTournamentPage />} />
        <Route path="/profile" element={<ProfileViewPage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/tournament/:tournamentId/dashboard" element={<DashboardPage />} />
        <Route path="/tournament/:tournamentId/teams" element={<TeamViewPage />} />
        <Route path="/tournament/:tournamentId/teams/new" element={<CreateTeamPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;