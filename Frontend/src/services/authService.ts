import api from './api';

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('auth_token');
};
