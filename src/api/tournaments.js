import api from './axios';

export const getTournaments = async () => {
  const response = await api.get('/tournaments');
  return response.data;
};

export const createTournament = async (data) => {
  const response = await api.post('/tournaments', data);
  return response.data;
};

export const getTournament = async (id) => {
  const response = await api.get(`/tournaments/${id}`);
  return response.data;
};

export const getTeamsInTournament = async (id) => {
  const response = await api.get(`/tournaments/${id}/teams`);
  return response.data;
};