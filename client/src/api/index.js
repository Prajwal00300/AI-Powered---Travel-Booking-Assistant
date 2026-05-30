import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser   = (data) => API.post('/auth/register', data);
export const loginUser      = (data) => API.post('/auth/login', data);
export const getMe          = ()     => API.get('/auth/me');

// Upload
export const uploadDocument = (formData) =>
  API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Trips API
export const getAllTrips = () => API.get('/trips');
export const getTripById = (id) => API.get(`/trips/${id}`);
export const deleteTrip = (id) => API.delete(`/trips/${id}`);

// Shared Public API
export const getSharedTrip = (id) => API.get(`/trips/shared/${id}`);

export default API;
