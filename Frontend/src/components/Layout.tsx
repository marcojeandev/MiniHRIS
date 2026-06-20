import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MiniHRIS</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Employee
          </NavLink>
          <NavLink to="/admin/salaries" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Salary
          </NavLink>
          <NavLink to="/admin/attendance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Attendance
          </NavLink>
          <NavLink to="/admin/payroll" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Payroll
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
