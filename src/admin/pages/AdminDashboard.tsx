import { useNavigate } from 'react-router-dom';
import { Layers, ListChecks, HelpCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import '../admin.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);
  const questions = useAppSelector((s) => s.adminQuestions.data);
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Platforms',
      value: platforms.length,
      icon: <Layers size={22} />,
      color: '#8b5cf6',
      to: '/admin/platforms',
      desc: 'Manage interview topics',
    },
    {
      label: 'Question Types',
      value: questionTypes.length,
      icon: <ListChecks size={22} />,
      color: '#06b6d4',
      to: '/admin/question-types',
      desc: 'Customize question formats',
    },
    {
      label: 'Questions',
      value: questions.length,
      icon: <HelpCircle size={22} />,
      color: '#10b981',
      to: '/admin/questions',
      desc: 'Interview question bank',
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="admin-page-title">Welcome back, Admin 👋</h1>
          <p className="admin-page-subtitle">
            Here's an overview of your interview app content.
          </p>
        </div>
        <div className="dashboard-updated">
          <TrendingUp size={14} />
          <span>All data synced to localStorage</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stats-grid">
        {stats.map((stat) => (
          <button
            key={stat.label}
            className="dashboard-stat-card"
            onClick={() => navigate(stat.to)}
            style={{ '--stat-color': stat.color } as React.CSSProperties}
          >
            <div className="stat-card-icon" style={{ background: `${stat.color}22`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-card-body">
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-desc">{stat.desc}</div>
            </div>
            <ArrowRight size={16} className="stat-card-arrow" />
          </button>
        ))}
      </div>

      {/* Quick overview */}
      <div className="dashboard-grid">
        {/* Recent platforms */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Platforms</h2>
            <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => navigate('/admin/platforms')}>
              View all
            </button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                </tr>
              </thead>
              <tbody>
                {platforms.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.color && (
                        <span
                          className="color-dot"
                          style={{ background: p.color }}
                        />
                      )}
                      {p.name}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-purple">{p.key}</span>
                    </td>
                  </tr>
                ))}
                {platforms.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                      No platforms yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Question types */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Question Types</h2>
            <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => navigate('/admin/question-types')}>
              View all
            </button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Fields</th>
                </tr>
              </thead>
              <tbody>
                {questionTypes.slice(0, 5).map((qt) => (
                  <tr key={qt.id}>
                    <td>{qt.name}</td>
                    <td>
                      <span className="admin-badge admin-badge-green">
                        {qt.fields.length} field{qt.fields.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
                {questionTypes.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                      No types yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
