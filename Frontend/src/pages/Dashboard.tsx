import { useEffect, useState } from 'react'
import type { Stats, AttendanceToday, RecentEmployee } from '../types/Dashboard'
import { 
  Users, 
  UserCheck, 
  UserX, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { dashboardApi } from '../services/api'
import toast from 'react-hot-toast'



const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    total_employees: 0,
    active_employees: 0,
    employees_on_leave: 0,
    total_monthly_payroll: 0,
  })
  const [attendanceToday, setAttendanceToday] = useState<AttendanceToday>({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
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
      
      setAttendanceToday(data.attendance_today || {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
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
      'active': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'leave': 'bg-amber-50 text-amber-700 border border-amber-200',
      'resigned': 'bg-red-50 text-red-700 border border-red-200',
    }
    return styles[status] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.total_employees,
      icon: Users,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Employees',
      value: stats.active_employees,
      icon: UserCheck,
      color: 'emerald',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'On Leave',
      value: stats.employees_on_leave,
      icon: UserX,
      color: 'amber',
      change: '-2%',
      trend: 'down'
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(stats.total_monthly_payroll),
      icon: DollarSign,
      color: 'purple',
      change: '+5.2%',
      trend: 'up'
    },
  ]

  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            All systems operational
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const colors = colorMap[stat.color as keyof typeof colorMap] || colorMap.blue

          return (
            <div 
              key={index}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100/80 hover:border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`${colors.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats & Recent Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Employees</h2>
              <p className="text-xs text-gray-500 mt-0.5">Newest additions to your team</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">No recent employees</td>
                  </tr>
                ) : (
                  recentEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold text-xs">
                            {emp.fullname.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{emp.fullname}</p>
                            <p className="text-xs text-gray-400">{emp.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">{emp.position}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">{emp.department}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(emp.employee_status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            emp.employee_status === 'active' ? 'bg-emerald-500' :
                            emp.employee_status === 'leave' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
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

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Today's Attendance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Records</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{attendanceToday.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{attendanceToday.present}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm text-gray-600">Late</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{attendanceToday.late}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <UserX className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{attendanceToday.absent}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">On Leave</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{attendanceToday.leave}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard