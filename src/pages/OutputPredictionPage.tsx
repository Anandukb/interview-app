import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  jsOutputPredictionQuestions, reactOutputPredictionQuestions, nodeOutputPredictionQuestions,
  tsOutputPredictionQuestions, htmlOutputPredictionQuestions, cssOutputPredictionQuestions,
} from '../data/parsedQuestions';
import type { OutputPredictionQuestion } from '../data/parsedQuestions';
import Editor from '@monaco-editor/react';
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { Button } from '../components/ui/Button';
import { useTheme } from '../theme/ThemeProvider';
import { cn } from '../lib/cn';
import { renderFormattedAnswer } from '../lib/markdown';

const OutputPredictionPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const { resolvedMode } = useTheme();
  const [selectedQuestion, setSelectedQuestion] = useState<OutputPredictionQuestion | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string[]>([]);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  let questions = jsOutputPredictionQuestions;
  if (platform === 'node') questions = nodeOutputPredictionQuestions;
  else if (platform === 'react') questions = reactOutputPredictionQuestions;
  else if (platform === 'ts') questions = tsOutputPredictionQuestions;
  else if (platform === 'html') questions = htmlOutputPredictionQuestions;
  else if (platform === 'css') questions = cssOutputPredictionQuestions;

  const isMultiSelect = selectedQuestion ? selectedQuestion.expectedOutput.length > 1 : false;

  useEffect(() => {
    setSelectedOutput([]);
    setIsAnswerShown(false);
    setIsCorrect(null);
  }, [selectedQuestion]);

  const handleSelectOption = (opt: string) => {
    if (isAnswerShown || !selectedQuestion) return;
    if (isMultiSelect) {
      setSelectedOutput([...selectedOutput, opt]);
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

  const handleReset = () => { setSelectedOutput([]); setIsAnswerShown(false); setIsCorrect(null); };

  const handleNextQuestion = () => {
    if (!selectedQuestion) return;
    const i = questions.findIndex((q) => q.id === selectedQuestion.id);
    setSelectedQuestion(questions[(i + 1) % questions.length]);
  };

  const inDetail = !!selectedQuestion;

  return (
    <PageShell fluid={inDetail} fixed={inDetail}>
      <PageNav
        backTo={inDetail ? undefined : `/${platform}`}
        backLabel="Formats"
        actions={
          inDetail && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedQuestion(null)} leftIcon={<ArrowLeft size={14} />}>
              Back to List
            </Button>
          )
        }
      />

      <div className="flex items-end justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Output <span className="gradient-text">Prediction</span>
        </h1>
        {inDetail && (
          <span className="text-xs text-fg-subtle">
            {questions.findIndex((q) => q.id === selectedQuestion.id) + 1} / {questions.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!inDetail ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                isSelected={false}
                onClick={() => setSelectedQuestion(q)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 flex-1 min-h-0"
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
            <div className="min-w-0 min-h-0 flex flex-col gap-3 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedQuestion.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-3"
                >
                  {/* Left: Code + options */}
                  <div className="flex flex-col gap-3 min-w-0">
                    <div className="bg-surface border border-border rounded-xl px-4 py-3">
                      <h2 className="text-base font-bold leading-snug">{selectedQuestion.title}</h2>
                    </div>

                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                      <Editor
                        height="320px"
                        defaultLanguage={platform === 'ts' ? 'typescript' : 'javascript'}
                        theme={resolvedMode === 'dark' ? 'vs-dark' : 'vs-light'}
                        value={selectedQuestion.code}
                        options={{
                          readOnly: true, minimap: { enabled: false }, fontSize: 14,
                          fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
                          padding: { top: 12 }, scrollBeyondLastLine: false, automaticLayout: true,
                        }}
                      />
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-4">
                      <h3 className="text-sm font-bold mb-1">
                        {isMultiSelect ? 'Predict the Output Order' : 'Predict the Output'}
                      </h3>
                      <p className="text-xs text-fg-muted mb-3">
                        {isMultiSelect
                          ? 'Click options below in the order they will be logged.'
                          : 'Analyze the code and select the correct output.'}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.options.map((opt, i) => {
                          const isSelected = selectedOutput.includes(opt);
                          const isCorrectOpt = opt === selectedQuestion.expectedOutput[0];

                          let classes = 'bg-surface-3 border-border text-fg hover:bg-surface-2 hover:border-border-strong';
                          if (!isMultiSelect && isAnswerShown) {
                            if (isCorrectOpt) classes = 'bg-success/15 border-success/40 text-success';
                            else if (isSelected) classes = 'bg-danger/15 border-danger/40 text-danger';
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => handleSelectOption(opt)}
                              disabled={isAnswerShown}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-mono border transition-all disabled:cursor-not-allowed',
                                classes
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Prediction + result */}
                  <div className="flex flex-col gap-3 min-w-0">
                    {isMultiSelect ? (
                      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold">Your Prediction</h3>
                          <Button variant="ghost" size="sm" onClick={handleReset} disabled={isAnswerShown} leftIcon={<RotateCcw size={14} />}>
                            Reset
                          </Button>
                        </div>

                        <div className="flex-1 min-h-[180px] space-y-2 mb-3 overflow-y-auto">
                          {selectedOutput.length === 0 ? (
                            <div className="h-full grid place-items-center border border-dashed border-border rounded-lg text-sm text-fg-subtle italic px-4 py-8 text-center">
                              Select options from the left to build your output.
                            </div>
                          ) : (
                            selectedOutput.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleRemoveSelection(i)}
                                disabled={isAnswerShown}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-3 border border-border hover:border-danger/40 hover:bg-danger/5 transition-colors text-left"
                              >
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand/15 text-brand text-xs font-bold">
                                  {i + 1}
                                </span>
                                <span className="flex-1 font-mono text-sm">{opt}</span>
                                {!isAnswerShown && <span className="text-fg-subtle">×</span>}
                              </button>
                            ))
                          )}
                        </div>

                        <Button onClick={handleShowAnswer} disabled={isAnswerShown || selectedOutput.length === 0} className="w-full">
                          Show Answer
                        </Button>
                      </div>
                    ) : (
                      !isAnswerShown && (
                        <div className="bg-surface border border-border rounded-xl p-8 text-center">
                          <CheckCircle size={32} className="mx-auto mb-3 text-fg-subtle" />
                          <h3 className="text-sm font-bold mb-1">Select your answer</h3>
                          <p className="text-xs text-fg-muted">
                            Analyze the code snippet and pick the option you think will be output to the console.
                          </p>
                        </div>
                      )
                    )}

                    {isAnswerShown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          'rounded-xl p-5 border',
                          isCorrect ? 'bg-success/8 border-success/40' : 'bg-danger/8 border-danger/40'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {isCorrect
                            ? <><CheckCircle size={22} className="text-success" /> <h3 className="text-base font-bold text-success">Correct!</h3></>
                            : <><XCircle size={22} className="text-danger" /> <h3 className="text-base font-bold text-danger">Incorrect</h3></>
                          }
                        </div>

                        {!isCorrect && (
                          <div className="mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-2">Expected Output</h4>
                            <div className="space-y-1.5">
                              {selectedQuestion.expectedOutput.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-success/20 text-success text-[10px] font-bold">
                                    {i + 1}
                                  </span>
                                  <code className="px-2 py-0.5 rounded bg-surface-3 border border-border font-mono text-sm">
                                    {opt}
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedQuestion.answer && (
                          <div className="mt-4 pt-4 border-t border-border/40">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-2">Explanation</h4>
                            <div className="text-sm leading-relaxed text-fg-muted">
                              {renderFormattedAnswer(selectedQuestion.answer)}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-4">
                          {!isCorrect && (
                            <Button variant="secondary" size="sm" onClick={handleReset} leftIcon={<RotateCcw size={14} />}>
                              Try Again
                            </Button>
                          )}
                          <Button size="sm" onClick={handleNextQuestion} rightIcon={<ArrowRight size={14} />} className="ml-auto">
                            Next Question
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile back-to-list FAB when in detail view */}
      {inDetail && (
        <button
          onClick={() => setSelectedQuestion(null)}
          className="lg:hidden fixed bottom-4 left-4 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface border border-border-strong shadow-lg text-sm font-medium"
        >
          <ArrowLeft size={14} />
          List
        </button>
      )}
    </PageShell>
  );
};

export default OutputPredictionPage;
