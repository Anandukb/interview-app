import { useEffect, useMemo, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, ListChecks, HelpCircle,
  LogOut, ChevronRight, ChevronDown, Menu, X, Database, Inbox, Users,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutAdmin } from '../../store/slices/adminAuthSlice';
import { fetchPendingChanges } from '../../store/slices/pendingChangesSlice';
import { supabase } from '../../lib/supabase';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Logo } from '../../components/Logo';
import { cn } from '../../lib/cn';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: number;
}

const QUESTIONS_PATH = '/admin/questions';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const pendingCount = useAppSelector(
    (s) => s.pendingChanges.data.filter((c) => c.status === 'pending').length
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Live-refresh the pending-changes badge via Supabase Realtime ────────────
  useEffect(() => {
    const channel = supabase
      .channel('pending_changes_admin_layout')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_changes' }, () => {
        dispatch(fetchPendingChanges());
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dispatch]);

  // This layout only ever renders for superadmins (contributors are routed to
  // the separate /contributor/* portal), so the full nav is always shown.
  const NAV_ITEMS: NavItem[] = useMemo(() => [
    { to: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/platforms',      icon: Layers,          label: 'Platforms' },
    { to: '/admin/question-types', icon: ListChecks,      label: 'Question Types' },
    { to: '/admin/questions',      icon: HelpCircle,      label: 'Questions' },
    { to: '/admin/pending-changes', icon: Inbox, label: 'Pending Changes', badge: pendingCount || undefined },
    { to: '/admin/seed',           icon: Database, label: 'Seed Data' },
    { to: '/admin/contributors',   icon: Users, label: 'Contributors' },
  ], [pendingCount]);

  const isQuestionsActive = location.pathname.startsWith(QUESTIONS_PATH);
  const activePlatformKey = new URLSearchParams(location.search).get('platform');

  const closeMobileNav = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const currentNavLabel =
    NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Admin';
  const activePlatform =
    activePlatformKey && isQuestionsActive
      ? platforms.find((p) => p.key.toLowerCase() === activePlatformKey.toLowerCase())
      : null;

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Mobile overlay */}
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

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 flex flex-col',
          'bg-surface border-r border-border',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex flex-col items-start gap-1 px-5 py-4 border-b border-border">
          <Logo height={36} />
          <span className="text-[10px] font-bold tracking-widest text-fg-subtle uppercase pl-1">
            Admin Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-2 mb-2 text-[10px] font-bold tracking-widest text-fg-subtle uppercase">
            Navigation
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isQuestionsItem = item.to === QUESTIONS_PATH;
              const expanded = isQuestionsItem && isQuestionsActive;

              return (
                <div key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeMobileNav}
                    end={isQuestionsItem}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                        'transition-colors duration-200',
                        isActive || (isQuestionsItem && isQuestionsActive)
                          ? 'text-brand'
                          : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
                      )
                    }
                  >
                    {({ isActive }) => {
                      const showActive = isActive || (isQuestionsItem && isQuestionsActive);
                      const Caret = isQuestionsItem
                        ? expanded ? ChevronDown : ChevronRight
                        : ChevronRight;
                      return (
                        <>
                          {/* Active background is a shared layout element, so it
                              slides between items instead of blinking. */}
                          {showActive && (
                            <motion.span
                              layoutId="admin-nav-active"
                              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                              className="absolute inset-0 rounded-xl bg-brand/12"
                            />
                          )}
                          {showActive && (
                            <motion.span
                              layoutId="admin-nav-rail"
                              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-brand"
                            />
                          )}
                          <Icon
                            size={18}
                            className={cn('relative z-10', showActive ? 'text-brand' : 'text-fg-subtle group-hover:text-fg')}
                          />
                          <span className="relative z-10 flex-1">{item.label}</span>
                          {!!item.badge && (
                            <span className="relative z-10 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand text-white text-[10px] font-bold tabular-nums">
                              {item.badge}
                            </span>
                          )}
                          <Caret
                            size={14}
                            className={cn(
                              'relative z-10 transition-transform duration-300',
                              showActive
                                ? 'opacity-100 translate-x-0 text-brand'
                                : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'
                            )}
                          />
                        </>
                      );
                    }}
                  </NavLink>

                  {isQuestionsItem && (
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          key="questions-sub"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 pl-3 mt-1 mb-1 border-l border-border space-y-0.5">
                            <SubNavLink
                              to={QUESTIONS_PATH}
                              active={!activePlatformKey}
                              onClick={closeMobileNav}
                              label="All Platforms"
                            />
                            {platforms.length === 0 ? (
                              <span className="block px-3 py-1.5 text-xs italic text-fg-subtle">
                                No platforms yet
                              </span>
                            ) : (
                              platforms.map((p) => (
                                <SubNavLink
                                  key={p.id}
                                  to={`${QUESTIONS_PATH}?platform=${encodeURIComponent(p.key)}`}
                                  active={activePlatformKey?.toLowerCase() === p.key.toLowerCase()}
                                  onClick={closeMobileNav}
                                  label={p.name}
                                />
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[10px] font-bold tracking-widest text-fg-subtle uppercase">Theme</span>
            <ThemeToggle compact />
          </div>
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main column ───────────────────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 flex items-center justify-between glass border-b border-border">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl text-fg-muted hover:bg-surface-3 hover:text-fg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-fg-muted">
            <span>{currentNavLabel}</span>
            {activePlatform && (
              <>
                <ChevronRight size={14} className="text-fg-subtle" />
                <span className="text-fg font-semibold">{activePlatform.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-surface-3 border border-border">
              <div className="h-6 w-6 grid place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-white text-xs font-bold">
                S
              </div>
              <span className="text-[13px] font-semibold">Superadmin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
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

interface SubNavLinkProps {
  to: string;
  active: boolean;
  label: string;
  onClick?: () => void;
}

const SubNavLink = ({ to, active, label, onClick }: SubNavLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      'block px-3 py-1.5 rounded-lg text-[13px] font-medium truncate',
      'transition-colors duration-200',
      active
        ? 'bg-brand/10 text-brand'
        : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
    )}
  >
    {label}
  </Link>
);

export default AdminLayout;
