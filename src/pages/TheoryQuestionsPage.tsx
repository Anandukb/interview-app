import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, AlertCircle, BookOpen, X } from 'lucide-react';
import { fetchQuestionsFor } from '../lib/publicQuestions';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { SearchInput } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/PageHeader';
import { fadeUp, stagger, collapse } from '../lib/motion';
import { cn } from '../lib/cn';

import { renderFormattedAnswer, renderInlineFormatting } from '../lib/markdown';

const TRACK_LABELS: Record<string, string> = {
  js: 'JavaScript', node: 'Node JS', react: 'React', 'react-native': 'React Native',
  ts: 'TypeScript', html: 'HTML', css: 'CSS',
};

interface TheoryQuestion {
  id: string;
  question: string;
  answer: string;
}

const TheoryQuestionsPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<TheoryQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trackTitle = TRACK_LABELS[platform ?? 'js'] ?? 'JavaScript';

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchQuestionsFor(platform ?? 'js', 'theory')
      .then((rows) => {
        if (!alive) return;
        setQuestions(rows.map((q) => ({ id: q.id, question: q.questions || q.title, answer: q.answer })));
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => { alive = false; };
  }, [platform]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (x) => x.question.toLowerCase().includes(q) || x.answer.toLowerCase().includes(q)
    );
  }, [searchQuery, questions]);

  return (
    <PageShell>
      <PageNav backTo={`/${platform}`} backLabel="Formats" />

      <motion.header variants={stagger(0.06)} initial="hidden" animate="show" className="pb-7">
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2.5 mb-4">
          <Badge tone="brand" dot>{trackTitle}</Badge>
          {!loading && (
            <Badge tone="neutral">
              {questions.length} question{questions.length === 1 ? '' : 's'}
            </Badge>
          )}
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]"
        >
          Theory <span className="gradient-text">questions</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-3 text-[15px] text-fg-muted max-w-xl">
          Tap any question to reveal a worked answer. Search across both questions and answers.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-6 max-w-md">
          <SearchInput
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions and answers…"
            icon={<Search size={16} />}
            trailing={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="grid h-6 w-6 place-items-center rounded-full text-fg-subtle hover:bg-surface-3 hover:text-fg transition-colors"
                >
                  <X size={13} />
                </button>
              ) : null
            }
          />
        </motion.div>

        {searchQuery && !loading && (
          <p className="mt-3 text-xs text-fg-subtle">
            {filtered.length} of {questions.length} match “{searchQuery}”
          </p>
        )}
      </motion.header>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-danger/8 border border-danger/25 text-danger text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>Failed to load questions: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyState
            icon={<BookOpen size={22} />}
            title={questions.length === 0 ? 'Nothing here yet' : 'No matches'}
            description={
              questions.length === 0
                ? 'No theory questions have been published for this track yet.'
                : `Nothing matches “${searchQuery}”. Try a shorter or different term.`
            }
          />
        </div>
      ) : (
        <motion.div variants={stagger(0.025)} initial="hidden" animate="show" className="space-y-2.5">
          {filtered.map((q, idx) => {
            const isOpen = openIds.has(q.id);
            return (
              <motion.div
                key={q.id}
                variants={fadeUp}
                className={cn(
                  'rounded-2xl border overflow-hidden bg-surface',
                  'transition-[border-color,box-shadow] duration-300',
                  isOpen
                    ? 'border-brand/45 shadow-md shadow-brand/5'
                    : 'border-border hover:border-border-strong'
                )}
              >
                <button
                  onClick={() => toggle(q.id)}
                  aria-expanded={isOpen}
                  className="group w-full flex items-start justify-between gap-4 px-4 sm:px-5 py-4 text-left"
                >
                  <span className="flex items-start gap-3.5 min-w-0">
                    <span
                      className={cn(
                        'shrink-0 grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold tabular-nums',
                        'transition-colors duration-300',
                        isOpen
                          ? 'bg-brand text-white'
                          : 'bg-surface-3 text-fg-subtle group-hover:bg-brand/12 group-hover:text-brand'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={cn(
                        'font-semibold text-[15px] leading-snug pt-0.5 transition-colors',
                        isOpen ? 'text-brand' : 'text-fg group-hover:text-brand'
                      )}
                    >
                      {renderInlineFormatting(q.question)}
                    </span>
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      'shrink-0 grid h-7 w-7 place-items-center rounded-full transition-colors',
                      isOpen ? 'text-brand bg-brand/10' : 'text-fg-subtle group-hover:bg-surface-3'
                    )}
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      variants={collapse}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-1">
                        <div className="pl-0 sm:pl-[42px] border-t border-border pt-4">
                          {renderFormattedAnswer(q.answer)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </PageShell>
  );
};

export default TheoryQuestionsPage;
