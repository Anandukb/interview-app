import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export const TableWrap = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('bg-surface border border-border rounded-2xl overflow-hidden shadow-sm edge-light', className)}>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export const Table = ({ children, className, ...rest }: HTMLAttributes<HTMLTableElement> & { children: ReactNode }) => (
  <table className={cn('w-full text-sm border-separate border-spacing-0', className)} {...rest}>
    {children}
  </table>
);

/** Sticky so the header stays legible while a long table scrolls. */
export const Th = ({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'sticky top-0 z-10 px-4 py-3 text-left',
      'text-[11px] font-bold uppercase tracking-[0.1em] text-fg-subtle',
      'bg-surface-2 border-b border-border',
      className
    )}
    {...rest}
  >
    {children}
  </th>
);

export const Td = ({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 align-middle border-b border-border', className)} {...rest}>
    {children}
  </td>
);

export const TableRow = ({ children, className, ...rest }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'group transition-colors hover:bg-surface-3/60 [&:last-child>td]:border-b-0',
      className
    )}
    {...rest}
  >
    {children}
  </tr>
);
