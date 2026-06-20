import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface PageShellProps {
  children: ReactNode;
  /** When true, drops the 80% width and uses the full viewport width. */
  fluid?: boolean;
  className?: string;
  /** When true, page content does not scroll; children control scrolling regions. */
  fixed?: boolean;
}

/**
 * User-facing page wrapper. Provides the bg + a centered container at 80%
 * of the viewport width (or full width when `fluid`). Pages compose their
 * own nav/header in flow — there is no sticky chrome.
 */
export const PageShell = ({
  children,
  fluid,
  className,
  fixed,
}: PageShellProps) => (
  <div className={cn(
    'bg-bg text-fg',
    fixed ? 'h-dvh flex flex-col overflow-hidden' : 'min-h-dvh'
  )}>
    <div className={cn(
      'mx-auto px-4 sm:px-6',
      fixed ? 'flex-1 min-h-0 flex flex-col py-3 sm:py-4' : 'py-4 sm:py-6',
      fluid ? 'w-full' : 'w-4/5',
      className
    )}>
      {children}
    </div>
  </div>
);
