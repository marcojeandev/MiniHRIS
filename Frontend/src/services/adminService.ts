import api from './api';

export const getEmployees = async () => {
  const response = await api.get('/admin/employees');
  return response.data;
};

export const getSalaries = async () => {
  const response = await api.get('/admin/salarys');
  return response.data;
};

export const getAttendance = async () => {
  const response = await api.get('/admin/attenadance');
  return response.data;
};

export const getPayroll = async () => {
  const response = await api.get('/admin/payroll');
  return response.data;
};
