export interface Stats {
  total_employees: number
  active_employees: number
  employees_on_leave: number
  total_monthly_payroll: number
}

export interface AttendanceToday {
  total: number
  present: number
  late: number
  absent: number
  leave: number
}

export interface RecentEmployee {
  id: number
  employee_id: string
  fullname: string
  position: string
  department: string
  employee_status: string
}