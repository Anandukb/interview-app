import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export const TableWrap = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn(
    'bg-surface border border-border rounded-xl overflow-hidden shadow-sm',
    className
  )}>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export const Table = ({ children, className, ...rest }: HTMLAttributes<HTMLTableElement> & { children: ReactNode }) => (
  <table className={cn('w-full text-sm', className)} {...rest}>
    {children}
  </table>
);

export const Th = ({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-fg-subtle',
      'bg-surface-2 border-b border-border',
      className
    )}
    {...rest}
  >
    {children}
  </th>
);

export const Td = ({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 align-middle', className)} {...rest}>
    {children}
  </td>
);

export const TableRow = ({ children, className, ...rest }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('border-b border-border last:border-b-0 hover:bg-surface-3/50 transition-colors', className)} {...rest}>
    {children}
  </tr>
);
