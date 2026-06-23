import { useEffect, useState } from 'react'
import { employeeApi, salaryApi } from '../services/api'
import toast from 'react-hot-toast'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  UserCheck,
  UserX,
  User,
  X,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Wallet,
  ArrowLeft
} from 'lucide-react'

interface Employee {
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

interface Salary {
  id: number
  employee_id: string
  basic_salary: number
  allowance: number
  deductions: number
  net_salary: number
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    fullname: '',
    email: '',
    contact: '',
    position: '',
    department: '',
    date_hired: '',
    employee_status: 'active',
  })

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)
  const [viewingSalary, setViewingSalary] = useState<Salary | null>(null)
  const [loadingSalary, setLoadingSalary] = useState(false)

  // Generate employee ID: EMP-001, EMP-002, etc.
  const generateEmployeeId = (employees: Employee[]) => {
    if (employees.length === 0) return 'EMP-001'
    
    const numbers = employees
      .map(emp => {
        const id = String(emp.employee_id)
        const match = id.match(/EMP-(\d+)/)
        return match ? parseInt(match[1]) : 0
      })
      .filter(num => num > 0)

    if (numbers.length === 0) return 'EMP-001'

    const maxNumber = Math.max(...numbers)
    const nextNumber = maxNumber + 1
    return `EMP-${String(nextNumber).padStart(3, '0')}`
  }

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll()
      const data = response.data.data || response.data || []
      setEmployees(data)
      
      if (!editingEmployee) {
        const newId = generateEmployeeId(data)
        setFormData(prev => ({ ...prev, employee_id: newId }))
      }
    } catch (error) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openCreateModal = () => {
    setEditingEmployee(null)
    const newId = generateEmployeeId(employees)
    setFormData({
      employee_id: newId,
      fullname: '',
      email: '',
      contact: '',
      position: '',
      department: '',
      date_hired: '',
      employee_status: 'active',
    })
    setShowModal(true)
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      employee_id: employee.employee_id,
      fullname: employee.fullname,
      email: employee.email,
      contact: employee.contact,
      position: employee.position,
      department: employee.department,
      date_hired: employee.date_hired,
      employee_status: employee.employee_status,
    })
    setShowModal(true)
  }

  const openViewModal = async (employee: Employee) => {
    setViewingEmployee(employee)
    setViewingSalary(null)
    setShowViewModal(true)
    setLoadingSalary(true)

    try {
      const response = await salaryApi.getByEmployee(employee.employee_id)
      const salaryData = response.data?.data || response.data
      setViewingSalary(salaryData)
    } catch (error) {
      // No salary found or error – just leave as null
      setViewingSalary(null)
    } finally {
      setLoadingSalary(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.id, formData)
        toast.success('Employee updated successfully!')
      } else {
        await employeeApi.create(formData)
        toast.success('Employee created successfully!')
      }
      setShowModal(false)
      fetchEmployees()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    try {
      await employeeApi.delete(id)
      toast.success('Employee deleted successfully!')
      fetchEmployees()
    } catch (error) {
      toast.error('Failed to delete employee')
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.fullname.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || emp.employee_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusCounts = () => ({
    all: employees.length,
    active: employees.filter(e => e.employee_status === 'active').length,
    resigned: employees.filter(e => e.employee_status === 'resigned').length,
    leave: employees.filter(e => e.employee_status === 'leave').length,
  })

  const statusCounts = getStatusCounts()

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'active': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'resigned': 'bg-red-50 text-red-700 border border-red-200',
      'leave': 'bg-amber-50 text-amber-700 border border-amber-200',
    }
    return styles[status] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const getStatusDot = (status: string) => {
    const styles: Record<string, string> = {
      'active': 'bg-emerald-500',
      'resigned': 'bg-red-500',
      'leave': 'bg-amber-500',
    }
    return styles[status] || 'bg-gray-500'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your workforce efficiently</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{statusCounts.all}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{statusCounts.active}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{statusCounts.leave}</p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <UserX className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resigned</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{statusCounts.resigned}</p>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg">
              <User className="h-5 w-5 text-red-600" />
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
            placeholder="Search by name, ID, position, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 hover:bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            Active ({statusCounts.active})
          </button>
          <button
            onClick={() => setStatusFilter('leave')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'leave'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
            }`}
          >
            On Leave ({statusCounts.leave})
          </button>
          <button
            onClick={() => setStatusFilter('resigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              statusFilter === 'resigned'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            Resigned ({statusCounts.resigned})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Hired</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No employees found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md">
                        {emp.employee_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {emp.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{emp.fullname}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(emp.date_hired)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(emp.employee_status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(emp.employee_status)}`} />
                        {emp.employee_status === 'leave' ? 'On Leave' : emp.employee_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openViewModal(emp)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======== VIEW MODAL ======== */}
      {showViewModal && viewingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  {viewingEmployee.fullname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{viewingEmployee.fullname}</h2>
                  <p className="text-sm text-gray-500">{viewingEmployee.employee_id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{viewingEmployee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-sm font-medium text-gray-900">{viewingEmployee.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Position</p>
                      <p className="text-sm font-medium text-gray-900">{viewingEmployee.position}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm font-medium text-gray-900">{viewingEmployee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Date Hired</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(viewingEmployee.date_hired)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(viewingEmployee.employee_status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(viewingEmployee.employee_status)}`} />
                        {viewingEmployee.employee_status === 'leave' ? 'On Leave' : viewingEmployee.employee_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Salary Details</h3>
                {loadingSalary ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : viewingSalary ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Basic Salary</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(viewingSalary.basic_salary)}</p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Allowance</p>
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(viewingSalary.allowance)}</p>
                    </div>
                    <div className="bg-red-50/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Deductions</p>
                      <p className="text-lg font-bold text-red-700">{formatCurrency(viewingSalary.deductions)}</p>
                    </div>
                    <div className="bg-purple-50/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Net Salary</p>
                      <p className="text-lg font-bold text-purple-700">{formatCurrency(viewingSalary.net_salary)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No salary record found for this employee</p>
                    <p className="text-xs text-gray-400 mt-1">Please add salary in the Salaries section</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======== ADD/EDIT MODAL ======== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                <input
                  name="employee_id"
                  type="text"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50/50"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1.5">Auto-generated (e.g., EMP-001)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact <span className="text-red-500">*</span></label>
                <input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Position <span className="text-red-500">*</span></label>
                  <input
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department <span className="text-red-500">*</span></label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Hired <span className="text-red-500">*</span></label>
                  <input
                    name="date_hired"
                    type="date"
                    value={formData.date_hired}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                  <select
                    name="employee_status"
                    value={formData.employee_status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="resigned">Resigned</option>
                    <option value="leave">On Leave</option>
                  </select>
                </div>
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
                      {editingEmployee ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingEmployee ? 'Update Employee' : 'Create Employee'
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

export default Employees