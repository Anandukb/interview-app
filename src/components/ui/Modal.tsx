import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Tailwind max-width utility, e.g. 'max-w-2xl', 'max-w-7xl'. */
  maxWidth?: string;
  /**
   * When true (default) the body has padding + internal vertical scroll.
   * When false, the modal becomes a flex column and children manage their
   * own scroll regions — useful for split-pane or sticky-footer layouts.
   */
  contained?: boolean;
  /** Tailwind max-h utility for the modal shell. Default: 'max-h-[90vh]'. */
  maxHeight?: string;
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl',
  contained = true,
  maxHeight = 'max-h-[90vh]',
}: ModalProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-black/55 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className={cn(
              'relative w-full bg-surface border border-border rounded-3xl shadow-xl flex flex-col edge-light',
              maxWidth,
              maxHeight,
              'overflow-hidden'
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.6 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-fg truncate">{title}</h2>
                {description && (
                  <p className="text-sm text-fg-muted mt-0.5">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 -mt-0.5 -mr-1 h-8 w-8 inline-flex items-center justify-center rounded-lg text-fg-muted hover:text-fg hover:bg-surface-3 hover:rotate-90 transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {contained ? (
              <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0">
                {children}
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col">
                {children}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
