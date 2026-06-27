import { useEffect, useState } from 'react'
import type { Employee, Payroll, PayrollSummary } from '../types/Payroll'
import { payrollApi, employeeApi, salaryApi } from '../services/api'
import toast from 'react-hot-toast'

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Printer,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Wallet,
  Calendar,
  User,
  Eye
} from 'lucide-react'


const Payroll = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [summary, setSummary] = useState<PayrollSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    allowance: '',
    deductions: '',
    net_salary: '',
    payroll_date: new Date().toISOString().split('T')[0],
  })

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // ✅ Fetch active employees only
  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAllActive()
      const data = response.data?.data || response.data || []
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load employees:', error)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.fullname.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())
  )

  const selectEmployee = async (emp: Employee) => {
    setFormData(prev => ({ ...prev, employee_id: emp.employee_id }))
    setEmployeeSearch(`${emp.fullname} (${emp.employee_id})`)
    setShowDropdown(false)

    try {
      const response = await salaryApi.getByEmployee(emp.employee_id)
      const salaryData = response.data?.data || response.data

      if (salaryData && salaryData.basic_salary) {
        setFormData(prev => ({
          ...prev,
          basic_salary: salaryData.basic_salary.toString(),
        }))
        toast.success('Basic salary loaded!')
      } else {
        toast.error('No fixed salary found for this employee. Please enter manually.')
      }
    } catch (error: any) {
      console.error('Failed to fetch salary:', error)
      if (error.response?.status !== 404) {
        toast.error('Failed to load salary data')
      } else {
        toast.error('No fixed salary found. Please enter manually.')
      }
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      const [payrollRes, summaryRes] = await Promise.all([
        payrollApi.getAll(),
        payrollApi.getSummary(),
      ])

      let payrollData = []
      if (payrollRes.data?.data) {
        payrollData = payrollRes.data.data
      } else if (Array.isArray(payrollRes.data)) {
        payrollData = payrollRes.data
      } else if (Array.isArray(payrollRes)) {
        payrollData = payrollRes
      }

      setPayrolls(payrollData)

      let summaryData = null
      if (summaryRes.data?.data) {
        summaryData = summaryRes.data.data
      } else if (summaryRes.data) {
        summaryData = summaryRes.data
      }

      setSummary(summaryData)
    } catch (error: any) {
      console.error('Error details:', error)
      toast.error(error.response?.data?.message || 'Failed to load payroll data')
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
    setEditingPayroll(null)
    setFormData({
      employee_id: '',
      basic_salary: '',
      allowance: '',
      deductions: '',
      net_salary: '',
      payroll_date: new Date().toISOString().split('T')[0],
    })
    setEmployeeSearch('')
    setShowModal(true)
  }

  const openEditModal = (payroll: Payroll) => {
    setEditingPayroll(payroll)
    setFormData({
      employee_id: payroll.employee_id,
      basic_salary: payroll.basic_salary.toString(),
      allowance: payroll.allowance.toString(),
      deductions: payroll.deductions.toString(),
      net_salary: payroll.net_salary.toString(),
      payroll_date: payroll.payroll_date,
    })
    setEmployeeSearch(`${payroll.employee?.fullname || ''} (${payroll.employee_id})`)
    setShowModal(true)
  }

  useEffect(() => {
    const basic = parseFloat(formData.basic_salary) || 0
    const allowance = parseFloat(formData.allowance) || 0
    const deductions = parseFloat(formData.deductions) || 0
    const net = basic + allowance - deductions
    setFormData(prev => ({ ...prev, net_salary: net.toFixed(2) }))
  }, [formData.basic_salary, formData.allowance, formData.deductions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        employee_id: formData.employee_id,
        basic_salary: parseFloat(formData.basic_salary) || 0,
        allowance: parseFloat(formData.allowance) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        net_salary: parseFloat(formData.net_salary) || 0,
        payroll_date: formData.payroll_date,
      }

      if (editingPayroll) {
        await payrollApi.update(editingPayroll.id, payload)
        toast.success('Payroll updated successfully!')
      } else {
        await payrollApi.create(payload)
        toast.success('Payroll created successfully!')
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
    if (!confirm('Are you sure you want to delete this payroll record?')) return
    try {
      await payrollApi.delete(id)
      toast.success('Payroll deleted successfully!')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete payroll')
    }
  }

  const handlePrint = (payroll: Payroll) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      toast.error('Please allow popups for this site')
      return
    }

    const employeeName = payroll.employee?.fullname || `Employee ${payroll.employee_id}`
    const formattedDate = new Date(payroll.payroll_date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payroll - ${employeeName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            max-width: 700px;
            margin: 0 auto;
            background: #f1f5f9;
            color: #1e293b;
          }
          .print-container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1e293b;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header h1 span {
            color: #2563eb;
          }
          .header p {
            color: #64748b;
            font-size: 14px;
            margin-top: 4px;
            letter-spacing: 1px;
          }
          .employee-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            border-left: 4px solid #2563eb;
          }
          .employee-info h2 {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .employee-info p {
            color: #64748b;
            font-size: 14px;
            margin: 2px 0;
          }
          .details {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0 30px;
          }
          .details tr {
            border-bottom: 1px solid #e2e8f0;
          }
          .details tr:last-child {
            border-bottom: none;
          }
          .details td {
            padding: 12px 0;
            font-size: 15px;
          }
          .details .label {
            color: #64748b;
            font-weight: 400;
          }
          .details .value {
            text-align: right;
            font-weight: 500;
            color: #1e293b;
          }
          .details .total-row {
            border-top: 2px solid #2563eb;
            border-bottom: 2px solid #2563eb;
          }
          .details .total-row td {
            padding: 16px 0;
            font-weight: 700;
            font-size: 18px;
          }
          .details .total-row .label {
            color: #1e293b;
          }
          .details .total-row .value {
            color: #2563eb;
            font-size: 20px;
          }
          .footer {
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .watermark {
            position: fixed;
            bottom: 40px;
            right: 40px;
            opacity: 0.05;
            font-size: 80px;
            font-weight: 700;
            color: #2563eb;
            pointer-events: none;
            z-index: 0;
          }
          .btn-container {
            text-align: center;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .btn-container .btn {
            padding: 10px 30px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin: 0 8px;
          }
          .btn-container .btn-print {
            background: #2563eb;
            color: #ffffff;
          }
          .btn-container .btn-print:hover {
            background: #1d4ed8;
          }
          .btn-container .btn-close {
            background: #e2e8f0;
            color: #1e293b;
          }
          .btn-container .btn-close:hover {
            background: #cbd5e1;
          }
          @media print {
            body { 
              padding: 20px; 
              background: #ffffff;
            }
            .print-container { 
              box-shadow: none; 
              padding: 20px; 
            }
            .btn-container { 
              display: none !important; 
            }
            .watermark { 
              opacity: 0.03; 
            }
            .employee-info { 
              background: #f8fafc !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
          }
          @media (max-width: 600px) {
            body { padding: 20px; }
            .print-container { padding: 20px; }
            .btn-container .btn { 
              padding: 8px 20px; 
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">MiniHRIS</div>
        <div class="print-container">
          <div class="header">
            <h1>Mini<span>HRIS</span></h1>
            <p>PAYROLL SLIP</p>
          </div>

          <div class="employee-info">
            <h2>${employeeName}</h2>
            <p><strong>Employee ID:</strong> ${payroll.employee_id}</p>
            <p><strong>Payroll Date:</strong> ${formattedDate}</p>
          </div>

          <table class="details">
            <tr>
              <td class="label">Basic Salary</td>
              <td class="value">${formatCurrency(payroll.basic_salary)}</td>
            </tr>
            <tr>
              <td class="label">Allowance</td>
              <td class="value">${formatCurrency(payroll.allowance)}</td>
            </tr>
            <tr>
              <td class="label">Deductions</td>
              <td class="value">${formatCurrency(payroll.deductions)}</td>
            </tr>
            <tr class="total-row">
              <td class="label">Net Salary</td>
              <td class="value">${formatCurrency(payroll.net_salary)}</td>
            </tr>
          </table>

          <div class="footer">
            <p>This is a system-generated payroll slip.</p>
            <p style="margin-top: 4px;">Generated on ${new Date().toLocaleString()}</p>
          </div>

          <div class="btn-container">
            <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
            <button class="btn btn-close" onclick="window.close()">✕ Close</button>
          </div>
        </div>
        <script>
          setTimeout(function() {}, 500);
        <\/script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const getEmployeeName = (payroll: Payroll) => {
    if (payroll.employee?.fullname) return payroll.employee.fullname
    return `Employee ${payroll.employee_id}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Filtered payrolls
  const filteredPayrolls = payrolls.filter((payroll) => {
    const matchesSearch =
      getEmployeeName(payroll).toLowerCase().includes(search.toLowerCase()) ||
      payroll.employee_id.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payroll data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and generate employee payroll</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Generate Payroll
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payroll</p>
              <p className="text-2xl font-bold text-blue-600 mt-0.5">{formatCurrency(summary?.total_payroll || 0)}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Employees</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{summary?.total_employees || 0}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <Users className="h-5 w-5 text-emerald-600" />
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
              <Wallet className="h-5 w-5 text-purple-600" />
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
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payroll Date</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No payroll records found</p>
                      <p className="text-gray-400 text-sm mt-1">Generate payroll to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((payroll, index) => (
                  <tr key={payroll.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                          {getEmployeeName(payroll).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getEmployeeName(payroll)}</p>
                          <p className="text-xs text-gray-400">{payroll.employee?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md">
                        {payroll.employee_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(payroll.basic_salary)}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600">{formatCurrency(payroll.allowance)}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{formatCurrency(payroll.deductions)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg">
                        {formatCurrency(payroll.net_salary)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payroll.payroll_date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(payroll)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payroll.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(payroll)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
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
                {editingPayroll ? 'Edit Payroll' : 'Generate Payroll'}
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
                <p className="text-xs text-gray-400 mt-1.5">Auto-filled from employee's fixed salary</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payroll Date <span className="text-red-500">*</span></label>
                <input
                  name="payroll_date"
                  type="date"
                  value={formData.payroll_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
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
                      {editingPayroll ? 'Updating...' : 'Generating...'}
                    </>
                  ) : (
                    editingPayroll ? 'Update Payroll' : 'Generate Payroll'
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

export default Payroll