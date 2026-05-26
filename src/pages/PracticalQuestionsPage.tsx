import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPracticalQuestions, reactPracticalQuestions, tsPracticalQuestions, htmlPracticalQuestions, cssPracticalQuestions } from '../data/mockQuestions';
import { nodePracticalQuestions } from '../data/nodeMockQuestions';
import type { Question } from '../data/mockQuestions';
import QuestionCard from '../components/QuestionCard';
import CodeCompiler from '../components/CodeCompiler';
import './PracticalQuestionsPage.css';

const PracticalQuestionsPage = () => {
  const navigate = useNavigate();
  const { platform } = useParams<{ platform: string }>();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  let questions = jsPracticalQuestions;
  if (platform === 'node') {
    questions = nodePracticalQuestions;
  } else if (platform === 'react') {
    questions = reactPracticalQuestions;
  } else if (platform === 'ts') {
    questions = tsPracticalQuestions;
  } else if (platform === 'html') {
    questions = htmlPracticalQuestions;
  } else if (platform === 'css') {
    questions = cssPracticalQuestions;
  }

  const handleBack = () => {
    if (selectedQuestion) {
      setSelectedQuestion(null);
    } else {
      navigate(`/${platform}`);
    }
  };

  return (
    <div className={`practical-container container ${selectedQuestion ? 'locked' : ''}`}>
      <div className="page-header">
        <button className="back-btn" onClick={handleBack}>
          &larr; {selectedQuestion ? 'Back to List' : 'Back to Formats'}
        </button>
        <h1 className="title">Practical <span className="gradient-text">Challenges</span></h1>
      </div>

      <div className={`layout-wrapper ${selectedQuestion ? 'has-selection' : ''}`}>
        
        {/* Sidebar / Grid Area */}
        <motion.div 
          className="questions-list-area"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 45 }}
        >
          <div className="questions-grid">
            <AnimatePresence>
              {questions.map(q => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  isSelected={selectedQuestion?.id === q.id}
                  compact={!!selectedQuestion}
                  onClick={() => setSelectedQuestion(q)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Content Area (Compiler) */}
        <AnimatePresence>
          {selectedQuestion && (
            <motion.div 
              className="active-question-area"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.2, delay: 0.1 }}
            >
              <div className="question-details glass">
                <div className="header-row">
                  <h2>{selectedQuestion.title}</h2>
                  <span className={`difficulty ${selectedQuestion.difficulty.toLowerCase()}`}>
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <p className="description">{selectedQuestion.description}</p>
              </div>

              <div className="compiler-section">
                <CodeCompiler
                  initialCode={selectedQuestion.startingCode}
                  answerCode={selectedQuestion.answerCode}
                  hint={selectedQuestion.hint}
                  language={platform === 'ts' ? 'typescript' : 'javascript'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PracticalQuestionsPage;
