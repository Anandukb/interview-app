import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Prefix the label with a small filled dot in the same tone. */
  dot?: boolean;
  children: ReactNode;
}

const TONE: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand border-brand/25',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/12 text-warning border-warning/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
  info: 'bg-info/10 text-info border-info/25',
  neutral: 'bg-surface-3 text-fg-muted border-border',
};

export const Badge = ({ tone = 'neutral', dot, className, children, ...rest }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border',
      'text-[11px] font-semibold tracking-wide',
      TONE[tone],
      className
    )}
    {...rest}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const DifficultyBadge = ({ value }: { value: string | undefined | null }) => {
  if (!value) return <span className="text-fg-subtle">—</span>;
  const v = value.toLowerCase();
  const tone: Tone =
    v === 'easy' ? 'success' : v === 'medium' ? 'warning' : v === 'hard' ? 'danger' : 'neutral';
  return <Badge tone={tone} dot className="capitalize">{value}</Badge>;
};
