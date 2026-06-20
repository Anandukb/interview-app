import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginAdmin, clearAdminAuthError } from '../../store/slices/adminAuthSlice';
import './AdminLogin.css';

const AdminLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((s) => s.adminAuth);

  const [email, setEmail] = useState(
    (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? ''
  );
  const [password, setPassword] = useState(
    (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? ''
  );
  const [showPass, setShowPass] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Clear error on unmount
  useEffect(() => () => { dispatch(clearAdminAuthError()); }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginAdmin({ email: email.trim(), password }));
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-1" />
      <div className="admin-login-glow admin-login-glow-2" />

      <div className="admin-login-card glass">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck size={28} />
          </div>
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-subtitle">Sign in to manage your interview app</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-login-label" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              className="admin-login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-login-label" htmlFor="admin-password">Password</label>
            <div className="admin-login-password-wrapper">
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                className="admin-login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-login-eye"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? <span className="admin-login-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="admin-login-hint">
          Local mode: credentials are validated against your <code>.env</code>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
