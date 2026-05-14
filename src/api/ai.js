import api from './axios';

export const getAiSuggestion = async (matchId) => {
  const response = await api.get(`/ai/suggest/${matchId}`);
  return response.data;
};