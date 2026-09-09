import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useSpotlight } from '../../lib/useSpotlight';
import { spring } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lift + brand ring on hover. */
  hoverable?: boolean;
  /** Remove padding so children manage their own. */
  bleed?: boolean;
  /** Frosted translucent surface instead of solid. */
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, bleed, glass, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-border shadow-sm edge-light',
        glass ? 'glass' : 'bg-surface',
        !bleed && 'p-5',
        hoverable && 'ring-brand-hover hover:-translate-y-0.5',
        className
      )}
      {...rest}
    />
  )
);
Card.displayName = 'Card';

type InteractiveCardProps = HTMLMotionProps<'button'> & {
  /** Thin accent rule drawn across the top edge, revealed on hover. */
  accent?: string;
  children: ReactNode;
};

/**
 * The primary clickable tile used across the public pages: a quiet surface
 * that lifts, catches a cursor-following spotlight, and reveals an accent
 * rule when pointed at. All motion is spring-driven so repeated hovers
 * interrupt each other gracefully.
 */
export const InteractiveCard = ({
  className,
  accent,
  children,
  ...rest
}: InteractiveCardProps) => {
  const { ref, onMouseMove } = useSpotlight<HTMLButtonElement>();

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMouseMove}
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985, y: -1 }}
      transition={spring}
      className={cn(
        'group relative w-full text-left overflow-hidden isolate',
        'rounded-2xl border border-border bg-surface p-5 shadow-sm spotlight edge-light',
        'transition-[box-shadow,border-color] duration-300',
        'hover:shadow-lg hover:border-border-strong',
        className
      )}
      {...rest}
    >
      {accent && (
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r',
            'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'group-hover:scale-x-100',
            accent
          )}
        />
      )}
      {children}
    </motion.button>
  );
};

export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex items-center gap-2 mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h3 className={cn('text-[11px] font-semibold text-fg-subtle uppercase tracking-[0.12em]', className)}>
    {children}
  </h3>
);
