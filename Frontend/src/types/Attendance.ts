export interface EmployeeAttendance {
  id: number
  employee_id: string
  fullname: string
  email: string
}

export interface AttendanceRecord {
  id: number
  employee_id: string
  employee_name: string
  date: string
  time_in: string
  time_out: string
  attendance_status: 'present' | 'late' | 'absent' | 'leave'
  employee?: {
    id: number
    fullname: string
    employee_id: string
  }
}