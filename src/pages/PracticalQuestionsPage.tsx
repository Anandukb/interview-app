import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import {
  jsPracticalQuestions, reactPracticalQuestions, tsPracticalQuestions,
  htmlPracticalQuestions, cssPracticalQuestions,
} from '../data/mockQuestions';
import { nodePracticalQuestions } from '../data/nodeMockQuestions';
import type { Question } from '../data/mockQuestions';
import QuestionCard from '../components/QuestionCard';
import CodeCompiler from '../components/CodeCompiler';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

const PracticalQuestionsPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  let questions = jsPracticalQuestions;
  if (platform === 'node') questions = nodePracticalQuestions;
  else if (platform === 'react') questions = reactPracticalQuestions;
  else if (platform === 'ts') questions = tsPracticalQuestions;
  else if (platform === 'html') questions = htmlPracticalQuestions;
  else if (platform === 'css') questions = cssPracticalQuestions;

  const inDetail = !!selectedQuestion;

  return (
    <PageShell fixed={inDetail}>
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
          Practical <span className="gradient-text">Challenges</span>
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
            <div className="min-w-0 min-h-0 flex flex-col gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedQuestion.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="bg-surface border border-border rounded-xl px-5 py-4"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <h2 className="text-base font-bold flex-1">{selectedQuestion.title}</h2>
                    <span className={cn(
                      'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                      selectedQuestion.difficulty.toLowerCase() === 'easy'
                        ? 'bg-success/15 text-success border-success/30'
                        : selectedQuestion.difficulty.toLowerCase() === 'medium'
                        ? 'bg-warning/15 text-warning border-warning/30'
                        : 'bg-danger/15 text-danger border-danger/30'
                    )}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-fg-muted leading-relaxed">{selectedQuestion.description}</p>
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

export default PracticalQuestionsPage;
