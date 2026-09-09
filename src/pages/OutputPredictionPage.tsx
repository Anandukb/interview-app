import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuestionsFor } from '../lib/publicQuestions';
import Editor from '@monaco-editor/react';
import {
  CheckCircle2, XCircle, RotateCcw, ArrowLeft, ArrowRight, AlertCircle, Terminal, List, MousePointerClick,
} from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/PageHeader';
import { useTheme } from '../theme/ThemeProvider';
import { fadeUp, popIn, stagger, viewSwap, spring } from '../lib/motion';
import { cn } from '../lib/cn';
import { renderFormattedAnswer } from '../lib/markdown';

interface OutputPredictionQuestion {
  id: string;
  title: string;
  code: string;
  expectedOutput: string[];
  options: string[];
  answer?: string;
}

const OutputPredictionPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const { resolvedMode } = useTheme();
  const [questions, setQuestions] = useState<OutputPredictionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<OutputPredictionQuestion | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string[]>([]);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setSelectedQuestion(null);
    fetchQuestionsFor(platform ?? 'js', 'output-prediction')
      .then((rows) => {
        if (!alive) return;
        setQuestions(rows.map((q) => ({
          id: q.id,
          title: q.title || q.questions,
          code: q.code,
          options: q.options.map((o) => o.label),
          expectedOutput: q.expectedOutput.split('\n').map((s) => s.trim()).filter(Boolean),
          answer: q.answer || undefined,
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

  const isMultiSelect = selectedQuestion ? selectedQuestion.expectedOutput.length > 1 : false;

  useEffect(() => {
    setSelectedOutput([]);
    setIsAnswerShown(false);
    setIsCorrect(null);
  }, [selectedQuestion]);

  const handleSelectOption = (opt: string) => {
    if (isAnswerShown || !selectedQuestion) return;
    if (isMultiSelect) {
      // Functional update: two clicks landing in the same React batch would
      // otherwise both read the same stale array and drop a selection.
      setSelectedOutput((prev) => [...prev, opt]);
    } else {
      setSelectedOutput([opt]);
      setIsCorrect(opt === selectedQuestion.expectedOutput[0]);
      setIsAnswerShown(true);
    }
  };

  const handleRemoveSelection = (i: number) => {
    if (isAnswerShown) return;
    setSelectedOutput((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleShowAnswer = () => {
    if (!selectedQuestion) return;
    setIsCorrect(JSON.stringify(selectedOutput) === JSON.stringify(selectedQuestion.expectedOutput));
    setIsAnswerShown(true);
  };

  const handleReset = () => {
    setSelectedOutput([]);
    setIsAnswerShown(false);
    setIsCorrect(null);
  };

  const handleNextQuestion = () => {
    if (!selectedQuestion) return;
    const i = questions.findIndex((q) => q.id === selectedQuestion.id);
    setSelectedQuestion(questions[(i + 1) % questions.length]);
  };

  const inDetail = !!selectedQuestion;
  const currentIndex = selectedQuestion
    ? questions.findIndex((q) => q.id === selectedQuestion.id) + 1
    : 0;

  return (
    <PageShell fluid={inDetail} fixed={inDetail} bare={inDetail}>
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
              All snippets
            </Button>
          )
        }
      />

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
            <Badge tone="warning" dot>Tricky</Badge>
            {!loading && (
              <Badge tone="neutral">
                {questions.length} snippet{questions.length === 1 ? '' : 's'}
              </Badge>
            )}
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]"
          >
            Output <span className="gradient-text">prediction</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 text-[15px] text-fg-muted max-w-xl">
            Read the snippet, commit to an answer, then find out exactly why the engine
            disagreed with you.
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
            icon={<Terminal size={22} />}
            title="No snippets yet"
            description="No output-prediction questions have been published for this track yet."
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

              <div className="min-w-0 min-h-0 flex flex-col gap-3 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedQuestion.id}
                    variants={viewSwap}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="grid grid-cols-1 xl:grid-cols-2 gap-3.5"
                  >
                    {/* ── Left: snippet + options ─────────────────────────── */}
                    <div className="flex flex-col gap-3.5 min-w-0">
                      <div className="rounded-2xl border border-border bg-surface overflow-hidden edge-light">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-2">
                          {/* Traffic lights — signals "this is a code window" instantly. */}
                          <span className="flex gap-1.5" aria-hidden>
                            <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
                            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                          </span>
                          <span className="ml-1 text-[11px] font-mono text-fg-subtle">
                            snippet.{platform === 'ts' ? 'ts' : 'js'}
                          </span>
                        </div>
                        <Editor
                          height="330px"
                          defaultLanguage={platform === 'ts' ? 'typescript' : 'javascript'}
                          theme={resolvedMode === 'dark' ? 'vs-dark' : 'vs-light'}
                          value={selectedQuestion.code}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13.5,
                            fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
                            padding: { top: 14, bottom: 14 },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            renderLineHighlight: 'none',
                cursorBlinking: 'smooth',
                          }}
                        />
                      </div>

                      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 edge-light">
                        <h3 className="text-sm font-bold">
                          {isMultiSelect ? 'Predict the output order' : 'Predict the output'}
                        </h3>
                        <p className="mt-1 text-xs text-fg-muted mb-4">
                          {isMultiSelect
                            ? 'Click the options in the order they will be logged.'
                            : 'Analyse the snippet and pick the value that reaches the console.'}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {selectedQuestion.options.map((opt, i) => {
                            const isPicked = selectedOutput.includes(opt);
                            const isCorrectOpt = opt === selectedQuestion.expectedOutput[0];

                            let tone =
                              'bg-surface-3 border-border text-fg hover:border-brand/45 hover:bg-brand/8 hover:text-brand';
                            if (!isMultiSelect && isAnswerShown) {
                              if (isCorrectOpt) tone = 'bg-success/12 border-success/40 text-success';
                              else if (isPicked) tone = 'bg-danger/12 border-danger/40 text-danger';
                              else tone = 'bg-surface-3 border-border text-fg-subtle opacity-60';
                            } else if (isMultiSelect && isPicked) {
                              tone = 'bg-brand/12 border-brand/40 text-brand';
                            }

                            return (
                              <motion.button
                                key={i}
                                onClick={() => handleSelectOption(opt)}
                                disabled={isAnswerShown}
                                whileHover={isAnswerShown ? {} : { y: -2 }}
                                whileTap={isAnswerShown ? {} : { scale: 0.95 }}
                                transition={spring}
                                className={cn(
                                  'px-3.5 py-2 rounded-xl text-sm font-mono border',
                                  'transition-colors duration-200 disabled:cursor-not-allowed',
                                  tone
                                )}
                              >
                                {opt}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ── Right: prediction + verdict ─────────────────────── */}
                    <div className="flex flex-col gap-3.5 min-w-0">
                      {isMultiSelect ? (
                        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 flex flex-col flex-1 min-h-0 edge-light">
                          <div className="flex items-center justify-between mb-3.5">
                            <h3 className="text-sm font-bold">Your prediction</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleReset}
                              disabled={isAnswerShown || selectedOutput.length === 0}
                              leftIcon={<RotateCcw size={13} />}
                            >
                              Reset
                            </Button>
                          </div>

                          <div className="flex-1 min-h-[190px] space-y-2 mb-4 overflow-y-auto">
                            {selectedOutput.length === 0 ? (
                              <div className="h-full grid place-items-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
                                <div>
                                  <MousePointerClick size={22} className="mx-auto mb-2 text-fg-subtle" />
                                  <p className="text-sm text-fg-subtle">
                                    Pick options on the left to build your output.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <AnimatePresence initial={false}>
                                {selectedOutput.map((opt, i) => (
                                  <motion.button
                                    key={`${opt}-${i}`}
                                    layout
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    transition={spring}
                                    onClick={() => handleRemoveSelection(i)}
                                    disabled={isAnswerShown}
                                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                               bg-surface-3 border border-border text-left
                                               hover:border-danger/40 hover:bg-danger/5 transition-colors
                                               disabled:hover:border-border disabled:hover:bg-surface-3"
                                  >
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/12 text-brand text-[11px] font-bold tabular-nums">
                                      {i + 1}
                                    </span>
                                    <span className="flex-1 font-mono text-sm truncate">{opt}</span>
                                    {!isAnswerShown && (
                                      <XCircle
                                        size={15}
                                        className="text-fg-subtle opacity-0 group-hover:opacity-100 group-hover:text-danger transition-opacity"
                                      />
                                    )}
                                  </motion.button>
                                ))}
                              </AnimatePresence>
                            )}
                          </div>

                          <Button
                            onClick={handleShowAnswer}
                            disabled={isAnswerShown || selectedOutput.length === 0}
                            className="w-full"
                          >
                            Check answer
                          </Button>
                        </div>
                      ) : (
                        !isAnswerShown && (
                          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
                            <Terminal size={26} className="mx-auto mb-3 text-fg-subtle" />
                            <h3 className="text-sm font-bold mb-1.5">Waiting on your call</h3>
                            <p className="text-xs text-fg-muted max-w-xs mx-auto leading-relaxed">
                              Read the snippet and choose the value you think reaches the console.
                            </p>
                          </div>
                        )
                      )}

                      <AnimatePresence>
                        {isAnswerShown && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={spring}
                            className={cn(
                              'rounded-2xl border p-5',
                              isCorrect
                                ? 'bg-success/6 border-success/35'
                                : 'bg-danger/6 border-danger/35'
                            )}
                          >
                            <div className="flex items-center gap-2.5 mb-4">
                              <motion.span
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ ...spring, delay: 0.08 }}
                                className={isCorrect ? 'text-success' : 'text-danger'}
                              >
                                {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                              </motion.span>
                              <h3
                                className={cn(
                                  'text-base font-bold',
                                  isCorrect ? 'text-success' : 'text-danger'
                                )}
                              >
                                {isCorrect ? 'Correct' : 'Not quite'}
                              </h3>
                            </div>

                            {!isCorrect && (
                              <div className="mb-4">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-fg-muted mb-2.5">
                                  Expected output
                                </h4>
                                <div className="space-y-1.5">
                                  {selectedQuestion.expectedOutput.map((opt, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.1 + i * 0.05 }}
                                      className="flex items-center gap-2.5"
                                    >
                                      <span className="grid h-5 w-5 place-items-center rounded-full bg-success/18 text-success text-[10px] font-bold tabular-nums">
                                        {i + 1}
                                      </span>
                                      <code className="px-2 py-0.5 rounded-md bg-surface-3 border border-border font-mono text-sm">
                                        {opt}
                                      </code>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedQuestion.answer && (
                              <div className="mt-4 pt-4 border-t border-border/60">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-fg-muted mb-2.5">
                                  Why
                                </h4>
                                <div className="text-sm leading-relaxed text-fg-muted">
                                  {renderFormattedAnswer(selectedQuestion.answer)}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-5">
                              {!isCorrect && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleReset}
                                  leftIcon={<RotateCcw size={13} />}
                                >
                                  Try again
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={handleNextQuestion}
                                rightIcon={<ArrowRight size={14} />}
                                className="ml-auto"
                              >
                                Next snippet
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
            All snippets
          </motion.button>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default OutputPredictionPage;
