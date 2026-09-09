import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginAdmin, clearAdminAuthError } from '../../store/slices/adminAuthSlice';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Logo } from '../../components/Logo';

const ContributorLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((s) => s.adminAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/contributor/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => () => { dispatch(clearAdminAuthError()); }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginAdmin({ email: email.trim(), password }));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg overflow-hidden px-4 py-10">
      {/* Shared ambient treatment — same drifting orbs + grid as the public site. */}
      <div className="ambient" aria-hidden>
        <div className="ambient-grid" />
        <div className="ambient-orb ambient-orb-a" />
        <div className="ambient-orb ambient-orb-b" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl shadow-xl p-8 edge-light">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo height={64} className="mb-4" />
            <p className="text-sm text-fg-muted">Contributor Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <Input
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

            <p className="text-center text-xs text-fg-subtle">
              Not a contributor yet?{' '}
              <Link to="/contributor/signup" className="font-semibold text-brand hover:underline">
                Request access
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ContributorLogin;
