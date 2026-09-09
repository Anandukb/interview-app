import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

/**
 * Fields sit on the inset surface at rest and lift to the card surface on
 * focus — the same "this is now active" cue the rest of the app uses.
 */
const FIELD_BASE =
  'w-full rounded-xl border border-border bg-surface-3 px-3.5 py-2.5 text-sm text-fg ' +
  'placeholder:text-fg-subtle outline-none ' +
  'transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
  'hover:border-border-strong ' +
  'focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_rgb(var(--brand)/0.12)] ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cn(FIELD_BASE, className)} {...rest} />
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
    <div className="relative group">
      <select ref={ref} className={cn(FIELD_BASE, 'appearance-none pr-10 cursor-pointer', className)} {...rest}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle
                   transition-transform duration-200 group-focus-within:rotate-180 group-focus-within:text-brand"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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
      <label className="text-[11px] font-semibold text-fg-muted uppercase tracking-[0.1em]">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <span className="text-xs text-danger">{error}</span>
    ) : hint ? (
      <span className="text-xs text-fg-subtle">{hint}</span>
    ) : null}
  </div>
);

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  /** Rendered at the right edge — e.g. a result count or clear button. */
  trailing?: ReactNode;
}

/** Field with a leading icon slot, used by the question search bars. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon, trailing, ...rest }, ref) => (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle">
          {icon}
        </span>
      )}
      <input ref={ref} className={cn(FIELD_BASE, !!icon && 'pl-10', !!trailing && 'pr-16', className)} {...rest} />
      {trailing && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">{trailing}</span>
      )}
    </div>
  )
);
SearchInput.displayName = 'SearchInput';
