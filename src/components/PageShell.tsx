import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface PageShellProps {
  children: ReactNode;
  /** Drop the max-width and use the full viewport width. */
  fluid?: boolean;
  className?: string;
  /** Page itself does not scroll; children own their scroll regions. */
  fixed?: boolean;
  /** Hide the decorative aurora + grid (used by dense, tool-like screens). */
  bare?: boolean;
}

/**
 * User-facing page wrapper.
 *
 * Renders a fixed decorative layer (drifting brand orbs + a fading grid)
 * behind a centred content column. The layer is `position: fixed` and
 * `pointer-events: none`, so it costs nothing in layout and never intercepts
 * clicks — content sits above it on its own stacking context.
 */
export const PageShell = ({ children, fluid, className, fixed, bare }: PageShellProps) => (
  <div className={cn('relative bg-bg text-fg', fixed ? 'h-dvh flex flex-col overflow-hidden' : 'min-h-dvh')}>
    {!bare && (
      <div className="ambient" aria-hidden>
        <div className="ambient-grid" />
        <div className="ambient-orb ambient-orb-a" />
        <div className="ambient-orb ambient-orb-b" />
      </div>
    )}

    <div
      className={cn(
        'relative z-10 mx-auto w-full px-5 sm:px-8',
        fixed ? 'flex-1 min-h-0 flex flex-col py-4' : 'py-5 sm:py-7',
        fluid ? 'max-w-none' : 'max-w-6xl',
        className
      )}
    >
      {children}
    </div>
  </div>
);
