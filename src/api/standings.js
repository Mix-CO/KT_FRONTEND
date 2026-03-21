import api from './axios';

export const getStandingsByTournament = async (tournamentId) => {
  const response = await api.get(`/standings/tournament/${tournamentId}`);
  return response.data;
};