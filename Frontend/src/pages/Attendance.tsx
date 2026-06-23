import { useEffect, useState } from 'react'
import { attendanceApi, employeeApi } from '../services/api'
import toast from 'react-hot-toast'
import {
  Search,
  Plus,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Filter
} from 'lucide-react'

interface Employee {
  id: number
  employee_id: string
  fullname: string
  email: string
}

interface AttendanceRecord {
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

const Attendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    time_in: '',
    time_out: '',
    attendance_status: 'present',
  })

  // Employee dropdown state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch employees for dropdown
 const fetchEmployees = async () => {
  try {
    const response = await employeeApi.getAllActive()
    console.log('Response:', response)  // Debug

    // ✅ Extract data correctly
    const data = response.data?.data
    if (Array.isArray(data)) {
      setEmployees(data)
    } else {
      console.warn('Data is not an array:', data)
      setEmployees([])
    }
  } catch (error) {
    console.error('Failed to load employees:', error)
    setEmployees([])
  }
}

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.fullname.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())
  )

  // Select an employee
  const selectEmployee = (emp: Employee) => {
    setFormData(prev => ({ ...prev, employee_id: emp.employee_id }))
    setEmployeeSearch(`${emp.fullname} (${emp.employee_id})`)
    setShowDropdown(false)
  }

  const fetchAttendance = async () => {
    try {
      const response = await attendanceApi.getAll()
      const data = response.data?.data || response.data || []
      setRecords(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
    fetchEmployees()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await attendanceApi.create(formData)
      toast.success('Attendance recorded successfully!')
      setShowModal(false)
      setFormData({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        time_in: '',
        time_out: '',
        attendance_status: 'present',
      })
      setEmployeeSearch('')
      fetchAttendance()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'present': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'late': 'bg-amber-50 text-amber-700 border border-amber-200',
      'absent': 'bg-red-50 text-red-700 border border-red-200',
      'leave': 'bg-blue-50 text-blue-700 border border-blue-200',
    }
    return styles[status] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const getStatusDot = (status: string) => {
    const styles: Record<string, string> = {
      'present': 'bg-emerald-500',
      'late': 'bg-amber-500',
      'absent': 'bg-red-500',
      'leave': 'bg-blue-500',
    }
    return styles[status] || 'bg-gray-500'
  }

  const getEmployeeName = (record: AttendanceRecord) => {
    if (record.employee?.fullname) return record.employee.fullname
    if (record.employee_name) return record.employee_name
    return `Employee ${record.employee_id}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Filtered records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      getEmployeeName(record).toLowerCase().includes(search.toLowerCase()) ||
      record.employee_id.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.attendance_status === statusFilter
    const matchesDate = !dateFilter || record.date === dateFilter
    
    return matchesSearch && matchesStatus && matchesDate
  })

  // Stats for summary cards
  const totalRecords = records.length
  const presentCount = records.filter(r => r.attendance_status === 'present').length
  const lateCount = records.filter(r => r.attendance_status === 'late').length
  const absentCount = records.filter(r => r.attendance_status === 'absent').length
  const leaveCount = records.filter(r => r.attendance_status === 'leave').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading attendance records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage employee attendance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Record Attendance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalRecords}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Present</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{presentCount}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Late</p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{lateCount}</p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <TrendingDown className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</p>
              <p className="text-2xl font-bold text-red-600 mt-0.5">{absentCount}</p>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</p>
              <p className="text-2xl font-bold text-blue-600 mt-0.5">{leaveCount}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 hover:bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'present'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setStatusFilter('late')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'late'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
            }`}
          >
            Late
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'absent'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            Absent
          </button>
          <button
            onClick={() => setStatusFilter('leave')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'leave'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            On Leave
          </button>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time In</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Out</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No attendance records found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {getEmployeeName(record).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getEmployeeName(record)}</p>
                          <p className="text-xs text-gray-400">{record.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.time_in || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.time_out || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(record.attendance_status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(record.attendance_status)}`} />
                        {record.attendance_status === 'leave' ? 'On Leave' : record.attendance_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Record Attendance</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Employee Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employee <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value)
                    setShowDropdown(true)
                    if (e.target.value === '') {
                      setFormData(prev => ({ ...prev, employee_id: '' }))
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search employee by name or ID..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
                {showDropdown && filteredEmployees.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => selectEmployee(emp)}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center"
                      >
                        <span className="text-sm font-medium text-gray-900">{emp.fullname}</span>
                        <span className="text-xs text-gray-500">{emp.employee_id}</span>
                      </div>
                    ))}
                  </div>
                )}
                {formData.employee_id && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Selected: <span className="font-medium">{formData.employee_id}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time In</label>
                  <input
                    name="time_in"
                    type="time"
                    value={formData.time_in}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Out</label>
                  <input
                    name="time_out"
                    type="time"
                    value={formData.time_out}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                <select
                  name="attendance_status"
                  value={formData.attendance_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="leave">On Leave</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    'Record Attendance'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance