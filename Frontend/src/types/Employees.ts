export interface Employee {
  id: number
  employee_id: string
  fullname: string
  email: string
  contact: string
  position: string
  department: string
  date_hired: string
  employee_status: 'active' | 'resigned' | 'leave'
}

export interface SalaryEmployee {
  id: number
  employee_id: string
  basic_salary: number
  allowance: number
  deductions: number
  net_salary: number
}