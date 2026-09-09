import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';
import { ThemeToggle } from './ui/ThemeToggle';
import { Logo } from './Logo';
import { spring } from '../lib/motion';
import { cn } from '../lib/cn';

interface PageNavProps {
  /** Back link target. When omitted, the brand mark takes the left slot. */
  backTo?: string;
  backLabel?: ReactNode;
  /** Right-side controls. The theme toggle is always appended. */
  actions?: ReactNode;
  /** Show an Admin shortcut on the right. */
  showAdminLink?: boolean;
  className?: string;
}

/**
 * Sticky top bar. It starts transparent and flush with the page, then
 * condenses into a frosted, bordered bar once the user scrolls — so the
 * hero gets the full canvas but the nav stays reachable.
 */
export const PageNav = ({
  backTo,
  backLabel = 'Back',
  actions,
  showAdminLink = false,
  className,
}: PageNavProps) => {
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    // Small hysteresis band stops the bar flickering when scrolling near 12px.
    setCondensed((prev) => (prev ? y > 6 : y > 18));
  });

  return (
    <motion.div
      className={cn(
        'sticky top-0 z-40 -mx-5 sm:-mx-8 mb-4 sm:mb-6',
        'px-5 sm:px-8 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300',
        condensed
          ? 'border-b border-border bg-surface/70 backdrop-blur-xl shadow-sm'
          : 'border-b border-transparent bg-transparent',
        className
      )}
    >
      <div className={cn('flex items-center justify-between gap-3 transition-all duration-300', condensed ? 'h-14' : 'h-16')}>
        {backTo ? (
          <Link
            to={backTo}
            className="group inline-flex items-center gap-2 h-9 pl-2.5 pr-3.5 rounded-xl text-sm font-medium
                       text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors"
          >
            <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
            {backLabel}
          </Link>
        ) : (
          <BrandMark />
        )}

        <div className="flex items-center gap-2">
          {actions}
          {showAdminLink && (
            <Link
              to="/admin/login"
              className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-xl text-[13px] font-semibold
                         text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors"
            >
              Admin
            </Link>
          )}
          <ThemeToggle compact />
        </div>
      </div>
    </motion.div>
  );
};

const BrandMark = () => (
  <Link to="/" className="inline-flex items-center group" aria-label="Int Hack home">
    <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring} className="inline-flex">
      <Logo height={34} />
    </motion.span>
  </Link>
);
