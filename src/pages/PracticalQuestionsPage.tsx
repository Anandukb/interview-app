import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertCircle, Laptop, List } from 'lucide-react';
import { fetchQuestionsFor } from '../lib/publicQuestions';
import QuestionCard from '../components/QuestionCard';
import CodeCompiler from '../components/CodeCompiler';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/PageHeader';
import { fadeUp, popIn, stagger, viewSwap, spring } from '../lib/motion';

interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  hint: string;
  startingCode: string;
  answerCode: string;
}

const capitalizeDifficulty = (d: string): Question['difficulty'] => {
  if (d.toLowerCase() === 'medium') return 'Medium';
  if (d.toLowerCase() === 'hard') return 'Hard';
  return 'Easy';
};

const DIFF_TONE = { Easy: 'success', Medium: 'warning', Hard: 'danger' } as const;

const PracticalQuestionsPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setSelectedQuestion(null);
    fetchQuestionsFor(platform ?? 'js', 'practical')
      .then((rows) => {
        if (!alive) return;
        setQuestions(rows.map((q) => ({
          id: q.id,
          title: q.title,
          difficulty: capitalizeDifficulty(q.difficulty),
          description: q.questions,
          hint: q.hint,
          startingCode: q.code,
          answerCode: q.solutionCode,
        })));
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => { alive = false; };
  }, [platform]);

  const inDetail = !!selectedQuestion;
  const currentIndex = selectedQuestion
    ? questions.findIndex((q) => q.id === selectedQuestion.id) + 1
    : 0;

  return (
    <PageShell fixed={inDetail} bare={inDetail}>
      <PageNav
        backTo={inDetail ? undefined : `/${platform}`}
        backLabel="Formats"
        actions={
          inDetail && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedQuestion(null)}
              leftIcon={<ArrowLeft size={14} />}
            >
              All challenges
            </Button>
          )
        }
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      {inDetail ? (
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
            {selectedQuestion.title}
          </h1>
          <span className="shrink-0 text-xs font-medium tabular-nums text-fg-subtle">
            {currentIndex} / {questions.length}
          </span>
        </div>
      ) : (
        <motion.header variants={stagger(0.06)} initial="hidden" animate="show" className="pb-7">
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2.5 mb-4">
            <Badge tone="brand" dot>Hands-on</Badge>
            {!loading && (
              <Badge tone="neutral">
                {questions.length} challenge{questions.length === 1 ? '' : 's'}
              </Badge>
            )}
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]"
          >
            Practical <span className="gradient-text">challenges</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 text-[15px] text-fg-muted max-w-xl">
            Write real code against a live editor, check it against the reference solution,
            and reach for a hint only when you're stuck.
          </motion.p>
        </motion.header>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-danger/8 border border-danger/25 text-danger text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>Failed to load questions: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl border border-border" />
          ))}
        </div>
      ) : !inDetail && questions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyState
            icon={<Laptop size={22} />}
            title="No challenges yet"
            description="No practical challenges have been published for this track yet."
          />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!inDetail ? (
            <motion.div
              key="grid"
              variants={stagger(0.03)}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5"
            >
              {questions.map((q) => (
                <motion.div key={q.id} variants={popIn}>
                  <QuestionCard question={q} isSelected={false} onClick={() => setSelectedQuestion(q)} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              variants={viewSwap}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)] gap-4 flex-1 min-h-0"
            >
              {/* Sidebar list */}
              <aside className="hidden lg:flex flex-col min-h-0 overflow-y-auto pr-1 gap-2">
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isSelected={selectedQuestion.id === q.id}
                    compact
                    onClick={() => setSelectedQuestion(q)}
                  />
                ))}
              </aside>

              {/* Detail */}
              <div className="min-w-0 min-h-0 flex flex-col gap-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedQuestion.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl border border-border bg-surface px-5 py-4 edge-light"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <h2 className="text-base font-bold flex-1 leading-snug">
                        {selectedQuestion.title}
                      </h2>
                      <Badge tone={DIFF_TONE[selectedQuestion.difficulty]} dot>
                        {selectedQuestion.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-fg-muted leading-relaxed">
                      {selectedQuestion.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex-1 min-h-0">
                  <CodeCompiler
                    key={selectedQuestion.id}
                    initialCode={selectedQuestion.startingCode}
                    answerCode={selectedQuestion.answerCode}
                    hint={selectedQuestion.hint}
                    language={platform === 'ts' ? 'typescript' : 'javascript'}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile: return to the list without scrolling back up. */}
      <AnimatePresence>
        {inDetail && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={spring}
            onClick={() => setSelectedQuestion(null)}
            className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30
                       inline-flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full
                       glass border-border-strong shadow-lg text-sm font-semibold"
          >
            <List size={15} />
            All challenges
          </motion.button>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default PracticalQuestionsPage;
