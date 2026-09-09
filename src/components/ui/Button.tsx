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
    'bg-brand text-white shadow-sm shadow-brand/25 hover:shadow-md hover:shadow-brand/30 ' +
    'hover:brightness-110 active:brightness-95',
  secondary:
    'bg-surface text-fg border border-border shadow-xs hover:bg-surface-2 hover:border-border-strong',
  ghost:
    'bg-transparent text-fg-muted hover:bg-surface-3 hover:text-fg',
  danger:
    'bg-danger/10 text-danger border border-danger/25 hover:bg-danger/16 hover:border-danger/45',
  outline:
    'bg-transparent text-fg border border-border-strong hover:bg-surface-3 hover:border-brand/50',
  subtle:
    'bg-brand/10 text-brand border border-brand/20 hover:bg-brand/15 hover:border-brand/35',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
  icon: 'h-10 w-10 p-0 justify-center rounded-xl',
  'icon-sm': 'h-8 w-8 p-0 justify-center rounded-lg',
};

/**
 * Buttons carry the app's tactile feedback: a 1px lift on hover and a real
 * press on :active. The sheen sweep on `primary` is decorative but cheap —
 * a single translated gradient behind the label.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, className, children, disabled, ...rest },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'group/btn relative inline-flex items-center justify-center overflow-hidden',
        'font-semibold select-none whitespace-nowrap',
        'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {variant === 'primary' && !disabled && !loading && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r
                     from-transparent via-white/25 to-transparent
                     transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
        />
      )}
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-[spin-slow_0.7s_linear_infinite]" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  )
);
Button.displayName = 'Button';
