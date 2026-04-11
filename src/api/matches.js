import api from './axios';

export const getMatchesByTournament = async (tournamentId) => {
  const response = await api.get(`/matches/tournament/${tournamentId}`);
  return response.data;
};