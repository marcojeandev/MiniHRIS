import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor: add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  
  logout: () =>
    api.post('/logout'),
  
  getUser: () =>
    api.get('/user'),
}

// Employee API calls
export const employeeApi = {
  getAll: () =>
    api.get('/admin/employees'),
  
  getById: (id: number) =>
    api.get(`/admin/employees/${id}`),
  
  create: (data: any) =>
    api.post('/admin/employees', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/employees/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/employees/${id}`),
}

// Attendance API calls
export const attendanceApi = {
  getAll: () =>
    api.get('/admin/attendance'),
  
  getByEmployee: (employeeId: number) =>
    api.get(`/admin/attendance/employee/${employeeId}`),
  
  create: (data: any) =>
    api.post('/admin/attendance', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/attendance/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/attendance/${id}`),
  
  getSummary: () =>
    api.get('/admin/attendance/summary'),
}

// Salary API calls
export const salaryApi = {
  getAll: () =>
    api.get('/admin/salaries'),
  
  getSummary: () =>
    api.get('/admin/salaries/summary'),
  
  create: (data: any) =>
    api.post('/admin/salaries', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/salaries/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/salaries/${id}`),
}

// Payroll API calls
export const payrollApi = {
  getAll: () =>
    api.get('/admin/payroll'),
  
  getSummary: () =>
    api.get('/admin/payroll/summary'),
}


export default api