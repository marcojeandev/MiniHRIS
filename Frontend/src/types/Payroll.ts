export interface Employee {
  id: number
  employee_id: string
  fullname: string
  email: string
  contact?: string
  position?: string
  department?: string
  date_hired?: string
  employee_status?: 'active' | 'resigned' | 'leave'
}

export interface Salary {
  id: number
  employee_id: string
  basic_salary: number
  allowance: number
  deductions: number
  net_salary: number
}

export interface Payroll {
  id: number
  employee_id: string
  basic_salary: number
  allowance: number
  deductions: number
  net_salary: number
  payroll_date: string
  employee?: Employee 
}

export interface PayrollSummary {
  total_payroll: number
  total_employees: number
  average_salary: number
}