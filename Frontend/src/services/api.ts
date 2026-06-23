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
      // ✅ Only redirect if NOT on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTH API CALLS
// ============================================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  
  logout: () =>
    api.post('/logout'),
  
  getUser: () =>
    api.get('/user'),
}

// ============================================
// DASHBOARD API CALLS
// ============================================
export const dashboardApi = {
  getData: () =>
    api.get('/admin/dashboard'),

  generatePayroll: () => 
    api.post('/admin/dashboard/generate-payroll'),
}

// ============================================
// EMPLOYEE API CALLS
// ============================================
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

// ============================================
// ATTENDANCE API CALLS
// ============================================
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

// ============================================
// SALARY API CALLS
// ============================================
export const salaryApi = {
  getAll: () =>
    api.get('/admin/salaries'),
  
  getByEmployee: (employeeId: string) =>
    api.get(`/admin/salaries/employee/${employeeId}`),  // ← ADD THIS
  
  getSummary: () =>
    api.get('/admin/salaries/summary'),
  
  create: (data: any) =>
    api.post('/admin/salaries', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/salaries/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/salaries/${id}`),
}

// ============================================
// PAYROLL API CALLS
// ============================================
export const payrollApi = {
  getAll: () =>
    api.get('/admin/payroll'),
  
  getSummary: () =>
    api.get('/admin/payroll/summary'),
  
  create: (data: any) =>
    api.post('/admin/payroll', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/payroll/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/payroll/${id}`),
}

export default api