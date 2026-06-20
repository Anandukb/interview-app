import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

const FIELD_BASE =
  'w-full bg-surface-3 border border-border rounded-lg px-3.5 py-2.5 text-sm text-fg ' +
  'placeholder:text-fg-subtle outline-none transition-all duration-150 ' +
  'focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={cn(FIELD_BASE, className)} {...rest} />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea ref={ref} className={cn(FIELD_BASE, 'min-h-24 resize-y leading-relaxed', className)} {...rest} />
  )
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          FIELD_BASE,
          'appearance-none pr-10 cursor-pointer',
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
);
Select.displayName = 'Select';

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const Field = ({ label, hint, error, required, children, className }: FieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && (
      <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
    )}
    {children}
    {error
      ? <span className="text-xs text-danger">{error}</span>
      : hint
        ? <span className="text-xs text-fg-subtle">{hint}</span>
        : null}
  </div>
);
