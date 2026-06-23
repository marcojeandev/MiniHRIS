import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, DollarSign } from 'lucide-react'
import { dashboardApi } from '../services/api'
import toast from 'react-hot-toast'

interface Stats {
  total_employees: number
  active_employees: number
  employees_on_leave: number
  total_monthly_payroll: number
}

interface RecentEmployee {
  id: number
  employee_id: string
  fullname: string
  position: string
  department: string
  employee_status: string
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    total_employees: 0,
    active_employees: 0,
    employees_on_leave: 0,
    total_monthly_payroll: 0,
  })
  const [recentEmployees, setRecentEmployees] = useState<RecentEmployee[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const response = await dashboardApi.getData()
      const data = response.data?.data || response.data
      
      setStats(data.stats || {
        total_employees: 0,
        active_employees: 0,
        employees_on_leave: 0,
        total_monthly_payroll: 0,
      })
      setRecentEmployees(data.recent_employees || [])
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'leave': 'bg-yellow-100 text-yellow-800',
      'resigned': 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_employees}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active_employees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Employees on Leave</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.employees_on_leave}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <UserX className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Monthly Payroll</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.total_monthly_payroll)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Employees</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No recent employees</td>
                </tr>
              ) : (
                recentEmployees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.employee_id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.fullname}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(emp.employee_status)}`}>
                        {emp.employee_status}
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
  )
}

export default Dashboard