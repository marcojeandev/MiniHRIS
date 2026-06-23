import { useEffect, useState, useRef } from 'react'
import { payrollApi, employeeApi, salaryApi } from '../services/api'
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
}

interface Payroll {
  id: number
  employee_id: string
  basic_salary: number
  allowance: number
  deductions: number
  net_salary: number
  payroll_date: string
  employee?: {
    id: number
    fullname: string
    employee_id: string
  }
}

interface PayrollSummary {
  total_payroll: number
  total_employees: number
  average_salary: number
}

const Payroll = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [summary, setSummary] = useState<PayrollSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null)
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

  const printRef = useRef<HTMLDivElement>(null)

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll()
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

        /* ✅ BUTTON STYLES */
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

        <!-- ✅ PRINT AND CLOSE BUTTONS -->
        <div class="btn-container">
          <button class="btn btn-print" onclick="window.print()">
            🖨️ Print
          </button>
          <button class="btn btn-close" onclick="window.close()">
            ✕ Close
          </button>
        </div>
      </div>

      <script>
        // ✅ Auto-open print dialog (with delay so buttons load)
        setTimeout(function() {
          // Uncomment below to auto-print
          // window.print();
        }, 500);
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
  }

  const getEmployeeName = (payroll: Payroll) => {
    if (payroll.employee?.fullname) {
      return payroll.employee.fullname
    }
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
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading payroll data...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Generate Payroll
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-500">Total Payroll</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.total_payroll || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{summary?.total_employees || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-600">
          <p className="text-sm text-gray-500">Average Salary</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.average_salary || 0)}</p>
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Payroll Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">No payroll records found</td>
                </tr>
              ) : (
                payrolls.map((payroll, index) => (
                  <tr key={payroll.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getEmployeeName(payroll)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payroll.employee_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(payroll.basic_salary)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(payroll.allowance)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(payroll.deductions)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(payroll.net_salary)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payroll.payroll_date)}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openEditModal(payroll)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(payroll.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handlePrint(payroll)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        🖨️ Print
                      </button>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPayroll ? 'Edit Payroll' : 'Generate Payroll'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <p className="text-xs text-gray-400 mt-1">Auto-filled from employee's fixed salary</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Net Salary</label>
                <input
                  name="net_salary"
                  type="number"
                  step="0.01"
                  value={formData.net_salary}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Auto-calculated: Basic + Allowance - Deductions</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Date</label>
                <input
                  name="payroll_date"
                  type="date"
                  value={formData.payroll_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPayroll ? 'Update' : 'Generate'}
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

export default Payroll