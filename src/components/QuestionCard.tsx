import { motion } from 'framer-motion';
import { useSpotlight } from '../lib/useSpotlight';
import { spring } from '../lib/motion';
import { cn } from '../lib/cn';

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    description?: string;
  };
  isSelected: boolean;
  onClick: () => void;
  /** Dense variant used in the detail-view sidebar. */
  compact?: boolean;
}

const DIFF_TONE: Record<string, string> = {
  easy: 'bg-success/12 text-success border-success/25',
  medium: 'bg-warning/12 text-warning border-warning/25',
  hard: 'bg-danger/12 text-danger border-danger/25',
};

const QuestionCard = ({ question, isSelected, onClick, compact = false }: QuestionCardProps) => {
  const { ref, onMouseMove } = useSpotlight<HTMLButtonElement>();
  const tone = DIFF_TONE[question.difficulty?.toLowerCase() ?? ''] ?? 'bg-surface-3 text-fg-muted border-border';

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMouseMove}
      onClick={onClick}
      whileHover={{ y: isSelected ? 0 : -3 }}
      whileTap={{ scale: 0.985 }}
      transition={spring}
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'group relative block w-full text-left rounded-2xl border bg-surface shadow-xs spotlight',
        'transition-[border-color,box-shadow] duration-300',
        compact ? 'p-3.5' : 'p-4',
        isSelected
          ? 'border-brand shadow-md shadow-brand/10'
          : 'border-border hover:border-border-strong hover:shadow-md'
      )}
    >
      {/* Active marker — a rule down the leading edge rather than a full ring,
          so a long sidebar of cards stays calm. */}
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-brand origin-center',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isSelected ? 'scale-y-100' : 'scale-y-0'
        )}
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        {question.difficulty && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border',
              'text-[10px] font-bold uppercase tracking-[0.08em]',
              tone
            )}
          >
            <span className="h-1 w-1 rounded-full bg-current" />
            {question.difficulty}
          </span>
        )}
        {!compact && <span className="text-[10px] font-mono text-fg-subtle">#{question.id}</span>}
      </div>

      <h3
        className={cn(
          'font-semibold leading-snug text-fg line-clamp-2 transition-colors',
          'group-hover:text-brand',
          isSelected && 'text-brand',
          compact ? 'text-[13px]' : 'text-[15px]'
        )}
      >
        {question.title}
      </h3>

      {!compact && question.description && (
        <p className="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-2">{question.description}</p>
      )}
    </motion.button>
  );
};

export default QuestionCard;
