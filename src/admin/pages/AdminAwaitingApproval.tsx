import { motion } from 'framer-motion';
import { Clock3, ShieldOff, LogOut } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logoutAdmin } from '../../store/slices/adminAuthSlice';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Logo } from '../../components/Logo';
import type { AdminRole } from '../../store/slices/adminAuthSlice';

interface AdminAwaitingApprovalProps {
  role: AdminRole | null;
}

const AdminAwaitingApproval = ({ role }: AdminAwaitingApprovalProps) => {
  const dispatch = useAppDispatch();

  const rejected = role === 'rejected';

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center gap-4">
          <Logo height={56} />

          <div className={rejected ? 'text-danger' : 'text-warning'}>
            {rejected ? <ShieldOff size={32} /> : <Clock3 size={32} />}
          </div>

          <h1 className="text-lg font-bold">
            {rejected ? 'Access revoked' : 'Awaiting approval'}
          </h1>

          <p className="text-sm text-fg-muted">
            {rejected
              ? 'A superadmin has revoked your access to the admin panel. Contact them if you think this is a mistake.'
              : 'Your account has been created but a superadmin still needs to approve it before you can use the admin panel. Check back later.'}
          </p>

          <Button variant="secondary" onClick={() => dispatch(logoutAdmin())} leftIcon={<LogOut size={14} />}>
            Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAwaitingApproval;
