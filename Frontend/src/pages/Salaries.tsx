import { useEffect, useState } from 'react'
import { salaryApi, employeeApi } from '../services/api'
import toast from 'react-hot-toast'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Wallet,
  Building2,
  User,
  Eye
} from 'lucide-react'

interface Employee {
  id: number
  employee_id: string
  fullname: string
  email: string
}

interface Salary {
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

interface SalarySummary {
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

const Salaries = () => {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [summary, setSummary] = useState<SalarySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    allowance: '',
    deductions: '',
  })

  // Employee dropdown state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll()
      const data = response.data?.data || response.data || []
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load employees:', error)
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

  // Fetch salaries and summary
  const fetchData = async () => {
    try {
      const [salariesRes, summaryRes] = await Promise.all([
        salaryApi.getAll(),
        salaryApi.getSummary(),
      ])
      
      const salariesData = salariesRes.data?.data || salariesRes.data || []
      setSalaries(Array.isArray(salariesData) ? salariesData : [])
      
      const summaryData = summaryRes.data?.data || summaryRes.data || null
      setSummary(summaryData)
    } catch (error) {
      toast.error('Failed to load salary data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchEmployees()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openCreateModal = () => {
    setEditingSalary(null)
    setFormData({
      employee_id: '',
      basic_salary: '',
      allowance: '',
      deductions: '',
    })
    setEmployeeSearch('')
    setShowModal(true)
  }

  const openEditModal = (salary: Salary) => {
    setEditingSalary(salary)
    setFormData({
      employee_id: salary.employee_id,
      basic_salary: salary.basic_salary.toString(),
      allowance: salary.allowance.toString(),
      deductions: salary.deductions.toString(),
    })
    setEmployeeSearch(`${salary.employee?.fullname || ''} (${salary.employee_id})`)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        employee_id: formData.employee_id,
        basic_salary: parseFloat(formData.basic_salary) || 0,
        allowance: parseFloat(formData.allowance) || 0,
        deductions: parseFloat(formData.deductions) || 0,
      }

      if (editingSalary) {
        await salaryApi.update(editingSalary.id, payload)
        toast.success('Salary updated successfully!')
      } else {
        await salaryApi.create(payload)
        toast.success('Salary created successfully!')
      }
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return
    try {
      await salaryApi.delete(id)
      toast.success('Salary deleted successfully!')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete salary')
    }
  }

  const getEmployeeName = (salary: Salary) => {
    if (salary.employee?.fullname) return salary.employee.fullname
    return `Employee ${salary.employee_id}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Filtered salaries
  const filteredSalaries = salaries.filter((salary) => {
    const matchesSearch =
      getEmployeeName(salary).toLowerCase().includes(search.toLowerCase()) ||
      salary.employee_id.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading salary data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Salaries</h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee salary structures</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add Salary
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{summary?.total_employees || 0}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payroll</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{formatCurrency(summary?.total_payroll || 0)}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average Salary</p>
              <p className="text-2xl font-bold text-purple-600 mt-0.5">{formatCurrency(summary?.average_salary || 0)}</p>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Highest Salary</p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{formatCurrency(summary?.highest_salary?.amount || 0)}</p>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">{summary?.highest_salary?.employee || 'N/A'}</p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <TrendingDown className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by employee name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 hover:bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Salary</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Allowance</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No salary records found</p>
                      <p className="text-gray-400 text-sm mt-1">Add a salary record to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((salary, index) => (
                  <tr key={salary.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-semibold text-sm">
                          {getEmployeeName(salary).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getEmployeeName(salary)}</p>
                          <p className="text-xs text-gray-400">{salary.employee?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md">
                        {salary.employee_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(salary.basic_salary)}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600">{formatCurrency(salary.allowance)}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{formatCurrency(salary.deductions)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg">
                        {formatCurrency(salary.net_salary)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(salary)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(salary.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSalary ? 'Edit Salary' : 'Add Salary'}
              </h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Basic Salary <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                  <input
                    name="basic_salary"
                    type="number"
                    step="0.01"
                    value={formData.basic_salary}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Allowance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                  <input
                    name="allowance"
                    type="number"
                    step="0.01"
                    value={formData.allowance}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deductions</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                  <input
                    name="deductions"
                    type="number"
                    step="0.01"
                    value={formData.deductions}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Net Salary Preview */}
              {formData.basic_salary && (
                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Net Salary Preview</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(
                      (parseFloat(formData.basic_salary) || 0) +
                      (parseFloat(formData.allowance) || 0) -
                      (parseFloat(formData.deductions) || 0)
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Basic + Allowance - Deductions</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingSalary ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingSalary ? 'Update Salary' : 'Create Salary'
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

export default Salaries