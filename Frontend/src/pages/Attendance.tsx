import { useState } from 'react'
import toast from 'react-hot-toast'

interface AttendanceRecord {
  id: number
  employeeId: string
  employeeName: string
  date: string
  timeIn: string
  timeOut: string
  status: 'present' | 'late' | 'absent' | 'on_leave'
}

const Attendance = () => {
  const [employeeId, setEmployeeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<AttendanceRecord[]>([
    {
      id: 1,
      employeeId: 'EMP-001',
      employeeName: 'Juan Dela Cruz',
      date: '2026-06-23',
      timeIn: '08:00',
      timeOut: '17:00',
      status: 'present',
    },
    {
      id: 2,
      employeeId: 'EMP-002',
      employeeName: 'Maria Santos',
      date: '2026-06-23',
      timeIn: '08:30',
      timeOut: '17:30',
      status: 'late',
    },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId.trim()) {
      toast.error('Please enter an Employee ID')
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      const now = new Date()
      const timeIn = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      const date = now.toISOString().split('T')[0]

      // Determine status (late if after 8:00 AM)
      const hour = now.getHours()
      const status = hour >= 8 && hour < 12 ? 'present' : 'late'

      const newRecord: AttendanceRecord = {
        id: records.length + 1,
        employeeId: employeeId,
        employeeName: `Employee ${employeeId}`,
        date: date,
        timeIn: timeIn,
        timeOut: '-',
        status: status,
      }

      setRecords([newRecord, ...records])
      setEmployeeId('')
      toast.success(`Attendance recorded: ${status}`)
    } catch (error) {
      toast.error('Failed to record attendance')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      on_leave: 'bg-blue-100 text-blue-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Attendance</h1>

        {/* Check-in Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Record Attendance</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter Employee ID (e.g., EMP-001)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Check In'}
            </button>
          </form>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No attendance records yet</td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.employeeId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.employeeName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.timeIn}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.timeOut}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(record.status)}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Attendance