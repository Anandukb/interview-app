import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { spring } from '../../lib/motion';
import { cn } from '../../lib/cn';

const ITEMS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={14} /> },
  { value: 'system', label: 'System', icon: <Monitor size={14} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={14} /> },
];

const NEXT: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' };

interface Props {
  compact?: boolean;
}

export const ThemeToggle = ({ compact }: Props) => {
  const { mode, setMode } = useTheme();

  if (compact) {
    return (
      <motion.button
        onClick={() => setMode(NEXT[mode])}
        aria-label={`Theme: ${mode}. Switch to ${NEXT[mode]}.`}
        title={`Theme: ${mode}`}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92, rotate: -12 }}
        transition={spring}
        className="relative h-9 w-9 inline-flex items-center justify-center rounded-xl
                   border border-border bg-surface text-fg-muted shadow-xs
                   hover:text-brand hover:border-brand/40 transition-colors"
      >
        {/* Icons cross-fade and spin so the mode change is legible, not abrupt. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={mode}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 grid place-items-center"
          >
            {ITEMS.find((i) => i.value === mode)?.icon}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 p-1 bg-surface-3 border border-border rounded-xl"
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
              'relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
              active ? 'text-fg' : 'text-fg-muted hover:text-fg'
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-toggle-bg"
                className="absolute inset-0 bg-surface rounded-lg shadow-sm"
                transition={spring}
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
