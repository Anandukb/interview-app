import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginAdmin, clearAdminAuthError } from '../../store/slices/adminAuthSlice';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Logo } from '../../components/Logo';

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

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => () => { dispatch(clearAdminAuthError()); }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginAdmin({ email: email.trim(), password }));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg overflow-hidden px-4 py-10">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-2/25 blur-3xl" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Logo height={64} className="mb-4" />
            <p className="text-sm text-fg-muted">Sign in to manage your interview app</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email" required>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-fg-subtle">
            Local mode: credentials are validated against your <code className="px-1.5 py-0.5 rounded bg-surface-3 text-brand">.env</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
