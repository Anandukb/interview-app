import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, ListChecks, HelpCircle, Inbox,
  LogOut, Menu, X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutAdmin } from '../../store/slices/adminAuthSlice';
import { fetchPendingChanges } from '../../store/slices/pendingChangesSlice';
import { supabase } from '../../lib/supabase';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Logo } from '../../components/Logo';
import { cn } from '../../lib/cn';

const NAV_ITEMS = [
  { to: '/contributor/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contributor/questions',       icon: HelpCircle,      label: 'Questions' },
  { to: '/contributor/platforms',       icon: Layers,          label: 'Platforms' },
  { to: '/contributor/question-types',  icon: ListChecks,      label: 'Question Types' },
  { to: '/contributor/pending-changes', icon: Inbox,           label: 'My Submissions' },
];

interface ContributorLayoutProps {
  children: React.ReactNode;
}

const ContributorLayout = ({ children }: ContributorLayoutProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingMineCount = useAppSelector(
    (s) => s.pendingChanges.data.filter((c) => c.status === 'pending').length
  );

  useEffect(() => {
    const channel = supabase
      .channel('pending_changes_contributor_layout')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_changes' }, () => {
        dispatch(fetchPendingChanges());
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dispatch]);

  const closeMobileNav = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    navigate('/contributor/login');
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={closeMobileNav}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 flex flex-col',
          'bg-surface border-r border-border',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col items-start gap-1 px-5 py-4 border-b border-border">
          <Logo height={36} />
          <span className="text-[10px] font-bold tracking-widest text-fg-subtle uppercase pl-1">
            Contributor Portal
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-2 mb-2 text-[10px] font-bold tracking-widest text-fg-subtle uppercase">
            Navigation
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const badge = item.to === '/contributor/pending-changes' ? pendingMineCount : 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileNav}
                  end
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                      'transition-colors duration-200',
                      isActive
                        ? 'text-brand'
                        : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Shared layout elements, so the highlight slides between items. */}
                      {isActive && (
                        <motion.span
                          layoutId="contributor-nav-active"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          className="absolute inset-0 rounded-xl bg-brand/12"
                        />
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="contributor-nav-rail"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-brand"
                        />
                      )}
                      <Icon
                        size={18}
                        className={cn('relative z-10', isActive ? 'text-brand' : 'text-fg-subtle group-hover:text-fg')}
                      />
                      <span className="relative z-10 flex-1">{item.label}</span>
                      {!!badge && (
                        <span className="relative z-10 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand text-white text-[10px] font-bold tabular-nums">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[10px] font-bold tracking-widest text-fg-subtle uppercase">Theme</span>
            <ThemeToggle compact />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 flex items-center justify-between glass border-b border-border">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl text-fg-muted hover:bg-surface-3 hover:text-fg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-fg-muted">
            <span>Contributor Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-surface-3 border border-border">
              <div className="h-6 w-6 grid place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-white text-xs font-bold">
                C
              </div>
              <span className="text-[13px] font-semibold">Contributor</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ContributorLayout;
