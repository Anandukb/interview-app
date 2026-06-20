import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand to-brand-2 text-white shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/35 hover:-translate-y-px active:translate-y-0',
  secondary:
    'bg-surface-3 text-fg border border-border hover:bg-surface-2 hover:border-border-strong',
  ghost:
    'bg-transparent text-fg-muted hover:bg-surface-3 hover:text-fg',
  danger:
    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 hover:border-danger/50',
  outline:
    'bg-transparent text-fg border border-border-strong hover:bg-surface-3',
  subtle:
    'bg-brand/10 text-brand border border-brand/25 hover:bg-brand/15',
};

const SIZES: Record<Size, string> = {
  sm:      'h-8 px-3 text-xs gap-1.5',
  md:      'h-10 px-4 text-sm gap-2',
  lg:      'h-12 px-6 text-base gap-2',
  icon:    'h-10 w-10 p-0 justify-center',
  'icon-sm': 'h-8 w-8 p-0 justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg',
          'transition-all duration-150 select-none whitespace-nowrap',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...rest}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-[spin-slow_0.8s_linear_infinite]" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
