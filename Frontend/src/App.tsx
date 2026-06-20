import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Layout from './components/Layout.tsx';
import Login from './pages/Login';
import Employees from './pages/admin/Employees';
import Salaries from './pages/admin/Salaries';
import Attendance from './pages/admin/Attendance';
import Payroll from './pages/admin/Payroll';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<Navigate to="/admin/employees" replace />} />
            <Route path="/admin/employees" element={<Employees />} />
            <Route path="/admin/salaries" element={<Salaries />} />
            <Route path="/admin/attendance" element={<Attendance />} />
            <Route path="/admin/payroll" element={<Payroll />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;