import { useEffect, useState } from 'react'
import { attendanceApi } from '../services/api'
import toast from 'react-hot-toast'

interface AttendanceRecord {
  id: number
  employee_id: number
  date: string
  time_in: string
  time_out: string
  attendance_status: 'present' | 'late' | 'absent' | 'on_leave'
  employee?: {
    id: number
    fullname: string
    employee_id: string
  }
}

interface Employee {
  id: number
  fullname: string
  employee_id: string
}

const Attendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    time_in: '',
    time_out: '',
    attendance_status: 'present',
  })

  // Fetch attendance records
  const fetchAttendance = async () => {
    try {
      const response = await attendanceApi.getAll()
      setRecords(response.data.data || response.data || [])
    } catch (error) {
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Submit form (create attendance)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      fetchAttendance()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong'
      toast.error(message)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'present': 'bg-green-100 text-green-800',
      'late': 'bg-yellow-100 text-yellow-800',
      'absent': 'bg-red-100 text-red-800',
      'on_leave': 'bg-blue-100 text-blue-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading attendance records...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Record Attendance
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-gray-900">
            {records.filter(r => r.attendance_status === 'present').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Late</p>
          <p className="text-2xl font-bold text-gray-900">
            {records.filter(r => r.attendance_status === 'late').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-gray-900">
            {records.filter(r => r.attendance_status === 'absent').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">On Leave</p>
          <p className="text-2xl font-bold text-gray-900">
            {records.filter(r => r.attendance_status === 'on_leave').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Time In</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Time Out</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No attendance records found</td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {record.employee?.fullname || `Employee #${record.employee_id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.time_in || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.time_out || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(record.attendance_status)}`}>
                        {record.attendance_status?.replace('_', ' ') || 'N/A'}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record Attendance</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  name="employee_id"
                  type="number"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
                <input
                  name="time_in"
                  type="time"
                  value={formData.time_in}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
                <input
                  name="time_out"
                  type="time"
                  value={formData.time_out}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="attendance_status"
                  value={formData.attendance_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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