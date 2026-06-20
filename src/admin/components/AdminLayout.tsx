import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { logoutAdmin } from '../../store/slices/adminAuthSlice';
import {
  LayoutDashboard,
  Layers,
  ListChecks,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Database,
} from 'lucide-react';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/platforms', icon: <Layers size={18} />, label: 'Platforms' },
  { to: '/admin/question-types', icon: <ListChecks size={18} />, label: 'Question Types' },
  { to: '/admin/questions', icon: <HelpCircle size={18} />, label: 'Questions' },
  { to: '/admin/seed', icon: <Database size={18} />, label: 'Seed Data' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const dispatch = useAppDispatch();
  const logout = () => dispatch(logoutAdmin());
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={22} />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-name">AdminPanel</span>
            <span className="admin-brand-sub">Interview App</span>
          </div>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav-label">Navigation</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-text">{item.label}</span>
              <ChevronRight size={14} className="admin-nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="admin-topbar-title">
            {NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Admin'}
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-user-badge">
              <div className="admin-user-avatar">A</div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
