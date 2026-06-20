import { motion } from 'framer-motion';
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
  compact?: boolean;
}

const DIFF_TONE: Record<string, string> = {
  easy:   'bg-success/15 text-success border-success/30',
  medium: 'bg-warning/15 text-warning border-warning/30',
  hard:   'bg-danger/15 text-danger border-danger/30',
};

const QuestionCard = ({ question, isSelected, onClick, compact = false }: QuestionCardProps) => (
  <motion.button
    onClick={onClick}
    whileHover={!isSelected ? { y: -1.5 } : {}}
    whileTap={{ scale: 0.99 }}
    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
    className={cn(
      'group block w-full text-left bg-surface border rounded-xl shadow-sm transition-colors',
      compact ? 'p-3' : 'p-4',
      isSelected
        ? 'border-brand ring-2 ring-brand/25 shadow-md shadow-brand/10'
        : 'border-border hover:border-border-strong hover:shadow-md'
    )}
  >
    <div className="flex items-center justify-between gap-2 mb-1.5">
      {question.difficulty && (
        <span className={cn(
          'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
          DIFF_TONE[question.difficulty.toLowerCase()] ?? 'bg-surface-3 text-fg-muted border-border'
        )}>
          {question.difficulty}
        </span>
      )}
      {!compact && <span className="text-[10px] font-mono text-fg-subtle">#{question.id}</span>}
    </div>
    <h3 className={cn(
      'font-semibold leading-snug text-fg line-clamp-2',
      compact ? 'text-sm' : 'text-[15px]'
    )}>
      {question.title}
    </h3>
    {!compact && question.description && (
      <p className="mt-1.5 text-xs text-fg-muted line-clamp-2">
        {question.description}
      </p>
    )}
  </motion.button>
);

export default QuestionCard;
