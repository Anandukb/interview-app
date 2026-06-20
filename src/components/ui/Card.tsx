import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bleed?: boolean; // remove padding so children manage it
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, bleed, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface border border-border rounded-xl shadow-sm',
        'transition-all duration-200',
        !bleed && 'p-5',
        hoverable && 'hover:border-border-strong hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
      {...rest}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex items-center gap-2 mb-4', className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h3 className={cn('text-sm font-semibold text-fg-muted uppercase tracking-wider', className)}>
    {children}
  </h3>
);
