import api from './axios';

export const getAvailableTimeSlots = async () => {
  const response = await api.get('/timeslots/available');
  return response.data;
};

export const getAllTimeSlots = async () => {
  const response = await api.get('/timeslots');
  return response.data;
};