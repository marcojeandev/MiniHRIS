import { useEffect, useState } from 'react'
import { salaryApi, employeeApi } from '../services/api'  // ← IMPORT BOTH
import toast from 'react-hot-toast'

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
    fetchEmployees() // ← Fetch employees when component mounts
  }, [])

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Open modal for create
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

  // Open modal for edit
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

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    }
  }

  // Delete salary
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

  // Get employee name helper
  const getEmployeeName = (salary: Salary) => {
    if (salary.employee?.fullname) {
      return salary.employee.fullname
    }
    return `Employee ${salary.employee_id}`
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
        <p className="text-gray-500">Loading salary data...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salaries</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Salary
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{summary?.total_employees || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-500">Total Payroll</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.total_payroll || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-600">
          <p className="text-sm text-gray-500">Average Salary</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.average_salary || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-600">
          <p className="text-sm text-gray-500">Highest Salary</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.highest_salary?.amount || 0)}</p>
          <p className="text-xs text-gray-500">{summary?.highest_salary?.employee || 'N/A'}</p>
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Allowance</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">No salary records found</td>
                </tr>
              ) : (
                salaries.map((salary, index) => (
                  <tr key={salary.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getEmployeeName(salary)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{salary.employee_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(salary.basic_salary)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(salary.allowance)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(salary.deductions)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(salary.net_salary)}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openEditModal(salary)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(salary.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal with Searchable Dropdown */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSalary ? 'Edit Salary' : 'Add Salary'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee ID - Searchable Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                
                {/* Dropdown */}
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
                
                {/* Show selected employee ID */}
                {formData.employee_id && (
                  <p className="text-xs text-gray-400 mt-1">
                    Selected: <span className="font-medium">{formData.employee_id}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                <input
                  name="basic_salary"
                  type="number"
                  step="0.01"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowance</label>
                <input
                  name="allowance"
                  type="number"
                  step="0.01"
                  value={formData.allowance}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                <input
                  name="deductions"
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSalary ? 'Update' : 'Create'}
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

export default Salaries