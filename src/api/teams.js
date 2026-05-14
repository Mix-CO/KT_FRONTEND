import api from './axios';

export const getTeam = async (id) => {
  const response = await api.get(`/teams/${id}`);
  return response.data;
};

export const getAllTeams = async () => {
  const response = await api.get('/teams');
  return response.data;
};

export const getTeamsByTournament = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/teams`);
  return response.data;
};

export const createTeam = async (data, creatorUserId) => {
  const response = await api.post(`/teams?creatorUserId=${creatorUserId}`, data);
  return response.data;
};

export const addPlayerToTeam = async (teamId, playerData) => {
  const response = await api.post(`/teams/${teamId}/players`, playerData);
  return response.data;
};

export const deleteTeam = async (id) => {
  await api.delete(`/teams/${id}`);
};