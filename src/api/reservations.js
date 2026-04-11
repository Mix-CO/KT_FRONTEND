import api from './axios';

export const getReservationsForMatch = async (matchId) => {
  const response = await api.get(`/reservations/match/${matchId}`);
  return response.data;
};

export const createReservation = async (data) => {
  const response = await api.post('/reservations', data);
  return response.data;
};

export const updateReservationStatus = async (reservationId, data) => {
  const response = await api.patch(`/reservations/${reservationId}/status`, data);
  return response.data;
};