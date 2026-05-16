import api from './axios';

export const getMatchesByTournament = async (tournamentId) => {
  const response = await api.get(`/matches/tournament/${tournamentId}`);
  return response.data;
};

export const createMatch = async (data) => {
  const response = await api.post('/matches', data);
  return response.data;
};

export const recordMatchResult = async (matchId, data) => {
  const response = await api.patch(`/matches/${matchId}/result`, data);
  return response.data;
};