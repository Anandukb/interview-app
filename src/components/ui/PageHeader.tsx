import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, actions, className }: PageHeaderProps) => (
  <div className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6', className)}>
    <div className="min-w-0">
      <h1 className="text-2xl sm:text-[1.7rem] font-bold tracking-tight text-fg leading-tight">{title}</h1>
      {description && <p className="text-sm text-fg-muted mt-1">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const ErrorBanner = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
    {children}
  </div>
);

export const WarningBanner = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
    {children}
  </div>
);

interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    {icon && (
      <div className="mb-4 h-14 w-14 grid place-items-center rounded-2xl bg-surface-3 text-fg-subtle">
        {icon}
      </div>
    )}
    {title && <h3 className="text-base font-semibold text-fg">{title}</h3>}
    {description && <p className="mt-1 text-sm text-fg-muted max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
