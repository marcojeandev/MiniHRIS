export interface EmployeeSalaries {
  id: number
  employee_id: string
  fullname: string
  email: string
}

export interface Salary {
  id: number
  employee_id: string
  basic_salary: number
  allowance: number
  deductions: number
  net_salary: number
  employee?: {
    id: number
    fullname: string
    employee_id: string
    email: string
  }
}

export interface SalarySummary {
  total_employees: number
  total_payroll: number
  average_salary: number
  highest_salary: {
    employee: string
    amount: number
  }
  lowest_salary: {
    employee: string
    amount: number
  }
}
