import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { cn } from '../../lib/cn';

const ITEMS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light',  label: 'Light',  icon: <Sun size={14} /> },
  { value: 'system', label: 'System', icon: <Monitor size={14} /> },
  { value: 'dark',   label: 'Dark',   icon: <Moon size={14} /> },
];

interface Props {
  compact?: boolean;
}

export const ThemeToggle = ({ compact }: Props) => {
  const { mode, setMode } = useTheme();

  if (compact) {
    return (
      <button
        onClick={() => setMode(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark')}
        aria-label="Toggle theme"
        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-2 hover:border-border-strong transition-colors text-fg-muted hover:text-fg"
        title={`Theme: ${mode}`}
      >
        {ITEMS.find((i) => i.value === mode)?.icon}
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 p-1 bg-surface-3 border border-border rounded-lg"
    >
      {ITEMS.map((item) => {
        const active = mode === item.value;
        return (
          <button
            key={item.value}
            role="radio"
            aria-checked={active}
            onClick={() => setMode(item.value)}
            className={cn(
              'relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              active ? 'text-fg' : 'text-fg-muted hover:text-fg'
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-toggle-bg"
                className="absolute inset-0 bg-surface rounded-md shadow-sm"
                transition={{ type: 'spring', damping: 22, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
