import api from './axios';

export const getUserAvailability = async (userId) => {
  const response = await api.get(`/availability/user/${userId}`);
  return response.data;
};

export const createAvailability = async (userId, timeSlotId) => {
  const response = await api.post('/availability', { userId, timeSlotId });
  return response.data;
};

export const deleteAvailability = async (availabilityId) => {
  await api.delete(`/availability/${availabilityId}`);
};