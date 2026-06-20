import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ui/ThemeToggle';
import { Logo } from './Logo';
import { cn } from '../lib/cn';

interface PageNavProps {
  /** Optional back link target. If omitted, brand mark is shown on the left. */
  backTo?: string;
  backLabel?: ReactNode;
  /** Right-side controls. Theme toggle is always appended automatically. */
  actions?: ReactNode;
  /** Show an Admin shortcut link on the right side (default: false). */
  showAdminLink?: boolean;
  className?: string;
}

export const PageNav = ({
  backTo,
  backLabel = 'Back',
  actions,
  showAdminLink = false,
  className,
}: PageNavProps) => (
  <div className={cn('flex items-center justify-between gap-3 mb-3 sm:mb-4', className)}>
    {backTo ? (
      <Link
        to={backTo}
        className="group inline-flex items-center gap-1.5 h-8 pl-2 pr-3 rounded-lg text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        {backLabel}
      </Link>
    ) : (
      <BrandMark />
    )}

    <div className="flex items-center gap-1.5">
      {actions}
      {showAdminLink && (
        <Link
          to="/admin/login"
          className="hidden sm:inline-flex items-center h-8 px-3 rounded-lg text-xs font-semibold text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors"
        >
          Admin
        </Link>
      )}
      <ThemeToggle compact />
    </div>
  </div>
);

const BrandMark = () => (
  <Link to="/" className="inline-flex items-center group" aria-label="Int Hack home">
    <motion.span
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="inline-flex"
    >
      <Logo height={32} />
    </motion.span>
  </Link>
);
