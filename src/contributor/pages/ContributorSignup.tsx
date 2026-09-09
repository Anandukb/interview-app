import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppDispatch } from '../../store/hooks';
import { initAdminAuth } from '../../store/slices/adminAuthSlice';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Logo } from '../../components/Logo';

const ContributorSignup = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      await dispatch(initAdminAuth());
      navigate('/contributor/dashboard', { replace: true });
      return;
    }

    setAwaitingEmailConfirm(true);
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
            <p className="text-sm text-fg-muted">Request contributor access</p>
          </div>

          {awaitingEmailConfirm ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <CheckCircle2 size={32} className="text-success" />
              <p className="text-sm text-fg">
                Check <span className="font-semibold">{email}</span> to confirm your address.
              </p>
              <p className="text-xs text-fg-muted">
                Once confirmed, a superadmin still needs to approve your account before you can
                access the contributor portal.
              </p>
              <Link to="/contributor/login" className="text-sm font-semibold text-brand hover:underline mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
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
                    autoComplete="new-password"
                    minLength={6}
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

              <Field label="Confirm password" required>
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
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
                {loading ? 'Creating account…' : 'Request Access'}
              </Button>

              <p className="text-center text-xs text-fg-subtle">
                Already have an account?{' '}
                <Link to="/contributor/login" className="font-semibold text-brand hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ContributorSignup;
