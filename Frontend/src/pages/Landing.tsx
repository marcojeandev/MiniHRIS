import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">Mini<span className="text-blue-600">HRIS</span></span>
            </div>
            {/* <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Admin Login
              </Link>
              <Link
                to="/attendance"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Attendance
              </Link>
            </div> */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Mini<span className="text-blue-600">HRIS</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6">
            Simplify Your Human Resource Management
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10">
            Manage employees, track attendance, handle salaries, and generate payroll — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              Admin Login
            </Link>
            <Link
              to="/attendance"
              className="px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl text-lg font-semibold border border-gray-200"
            >
              Employee Attendance
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Management</h3>
              <p className="text-gray-500 text-sm">Add, edit, and manage all employee information in one place.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Tracking</h3>
              <p className="text-gray-500 text-sm">Record and monitor employee attendance with ease.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payroll Management</h3>
              <p className="text-gray-500 text-sm">Generate payroll and manage salary records effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MiniHRIS. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Built with ❤️ for HR management
          </p>
        </div>
      </footer> */}
    </div>
  )
}

export default Landing