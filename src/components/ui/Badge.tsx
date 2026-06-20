import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

const TONE: Record<Tone, string> = {
  brand:   'bg-brand/15 text-brand border border-brand/30',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  danger:  'bg-danger/15 text-danger border border-danger/30',
  info:    'bg-info/15 text-info border border-info/30',
  neutral: 'bg-surface-3 text-fg-muted border border-border',
};

export const Badge = ({ tone = 'neutral', className, children, ...rest }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      TONE[tone],
      className
    )}
    {...rest}
  >
    {children}
  </span>
);

export const DifficultyBadge = ({ value }: { value: string | undefined | null }) => {
  if (!value) return <span className="text-fg-subtle">—</span>;
  const v = value.toLowerCase();
  const tone: Tone = v === 'easy' ? 'success' : v === 'medium' ? 'warning' : v === 'hard' ? 'danger' : 'neutral';
  return <Badge tone={tone} className="capitalize">{value}</Badge>;
};
