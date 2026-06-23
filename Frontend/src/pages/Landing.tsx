import { Link } from 'react-router-dom'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Mini<span className="text-blue-600">HRIS</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Secure HR Management
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
            Simplify Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              HR Operations
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Manage employees, track attendance, handle salaries, and generate payroll — all in one powerful platform.
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/attendance"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl border border-gray-200"
            >
              <Clock className="h-5 w-5 text-blue-600" />
              Employee Attendance
            </Link>
          </div> */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Free to Use</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools to manage your workforce efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="w-14 h-14 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Employee Management</h3>
              <p className="text-gray-500 leading-relaxed">
                Add, edit, and manage all employee information, roles, and departments in one centralized dashboard.
              </p>
            </div>
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="w-14 h-14 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors flex items-center justify-center mb-5">
                <Calendar className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Attendance Tracking</h3>
              <p className="text-gray-500 leading-relaxed">
                Record time-ins and time-outs, track attendance status, and generate attendance reports with ease.
              </p>
            </div>
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="w-14 h-14 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors flex items-center justify-center mb-5">
                <DollarSign className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payroll Management</h3>
              <p className="text-gray-500 leading-relaxed">
                Automate salary computations, manage deductions and allowances, and generate payslips effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Simplify HR?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses managing their workforce with MiniHRIS.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Mini<span className="text-blue-400">HRIS</span></span>
            </div>
            <p className="text-gray-400 text-sm">
              Simplify your HR management with our powerful platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/attendance" className="hover:text-white transition-colors">Attendance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>pagotaisidromarcojean@gmail.com</li>
              <li>0935 774 5262</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} MiniHRIS. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Landing