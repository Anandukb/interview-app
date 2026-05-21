import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { outputPredictionQuestions, nodeOutputPredictionQuestions } from '../data/parsedQuestions';
import type { OutputPredictionQuestion } from '../data/parsedQuestions';
import Editor from '@monaco-editor/react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import { motion, AnimatePresence } from 'framer-motion';
import './OutputPredictionPage.css';

const OutputPredictionPage = () => {
  const navigate = useNavigate();
  const { track } = useParams<{ track: string }>();
  const [selectedQuestion, setSelectedQuestion] = useState<OutputPredictionQuestion | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string[]>([]);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const isNode = track === 'node';
  const questions = isNode ? nodeOutputPredictionQuestions : outputPredictionQuestions;
  const isMultiSelect = selectedQuestion ? selectedQuestion.expectedOutput.length > 1 : false;

  useEffect(() => {
    // Reset state when question changes
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
      const correctOpt = selectedQuestion.expectedOutput[0];
      setIsCorrect(opt === correctOpt);
      setIsAnswerShown(true);
    }
  };

  const handleRemoveSelection = (index: number) => {
    if (isAnswerShown) return;
    const newSelected = [...selectedOutput];
    newSelected.splice(index, 1);
    setSelectedOutput(newSelected);
  };

  const handleShowAnswer = () => {
    if (!selectedQuestion) return;
    const isOrderCorrect = JSON.stringify(selectedOutput) === JSON.stringify(selectedQuestion.expectedOutput);
    setIsCorrect(isOrderCorrect);
    setIsAnswerShown(true);
  };

  const handleReset = () => {
    setSelectedOutput([]);
    setIsAnswerShown(false);
    setIsCorrect(null);
  };

  const handleBack = () => {
    if (selectedQuestion) {
      setSelectedQuestion(null);
    } else {
      navigate(`/${track}`);
    }
  };

  const handleNextQuestion = () => {
    if (!selectedQuestion) return;
    const currentIndex = questions.findIndex(q => q.id === selectedQuestion.id);
    const nextIndex = (currentIndex + 1) % questions.length;
    setSelectedQuestion(questions[nextIndex]);
  };

  return (
    <div className={`output-prediction-container container ${selectedQuestion ? 'locked' : ''}`}>
      <div className="page-header">
        <button className="back-btn" onClick={handleBack}>
          &larr; {selectedQuestion ? 'Back to List' : 'Back to Formats'}
        </button>
        <h1 className="title">Output <span className="gradient-text">Prediction</span></h1>
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

        {/* Main Content Area (Prediction Panel) */}
        <AnimatePresence>
          {selectedQuestion && (
            <motion.div 
              className="active-question-area"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.2, delay: 0.1 }}
            >
              <div className="prediction-layout-panel">
                
                {/* Left Side: Code & Options */}
                <div className="left-panel">
                  <div className="question-header glass">
                    <h2>{selectedQuestion.title}</h2>
                  </div>

                  <div className="code-viewer glass">
                    <Editor
                      height="300px"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={selectedQuestion.code}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Courier New", monospace',
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>

                  <div className="interaction-area glass">
                    <h3>{isMultiSelect ? 'Predict the Output Order' : 'Predict the Output'}</h3>
                    <p className="subtitle">
                      {isMultiSelect 
                        ? 'Click the blocks below in the exact order they will be logged to the console.' 
                        : 'Analyze the code and select the correct output option.'}
                    </p>
                    
                    <div className="available-options">
                      {isMultiSelect ? (
                        selectedQuestion.options.map((opt, i) => (
                          <button 
                            key={i} 
                            className="chip option-chip"
                            onClick={() => handleSelectOption(opt)}
                            disabled={isAnswerShown}
                          >
                            {opt}
                          </button>
                        ))
                      ) : (
                        selectedQuestion.options.map((opt, i) => {
                          const isSelected = selectedOutput.includes(opt);
                          const isCorrectOpt = opt === selectedQuestion.expectedOutput[0];
                          
                          let chipClass = "chip option-chip";
                          if (isAnswerShown) {
                            if (isCorrectOpt) {
                              chipClass += " correct";
                            } else if (isSelected) {
                              chipClass += " incorrect";
                            }
                          }

                          return (
                            <button 
                              key={i} 
                              className={chipClass}
                              onClick={() => handleSelectOption(opt)}
                              disabled={isAnswerShown}
                            >
                              {opt}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: User Prediction & Answer Validation */}
                <div className="right-panel">
                  {isMultiSelect ? (
                    <div className="user-prediction glass">
                      <div className="panel-header">
                        <h3>Your Prediction</h3>
                        <button className="reset-btn" onClick={handleReset} disabled={isAnswerShown}>
                          <RotateCcw size={16} /> Reset
                        </button>
                      </div>
                      
                      <div className="selected-lines">
                        {selectedOutput.length === 0 ? (
                          <div className="empty-state">Select options from the left to build your output.</div>
                        ) : (
                          selectedOutput.map((opt, i) => (
                            <div key={i} className="selected-line" onClick={() => handleRemoveSelection(i)}>
                              <span className="line-number">{i + 1}</span>
                              <span className="line-content">{opt}</span>
                              {!isAnswerShown && <span className="remove-hint">×</span>}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="actions-footer">
                        <button 
                          className="btn-primary full-width" 
                          onClick={handleShowAnswer}
                          disabled={isAnswerShown || selectedOutput.length === 0}
                        >
                          Show Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    !isAnswerShown && (
                      <div className="prediction-placeholder glass">
                        <div className="placeholder-content">
                          <CheckCircle size={32} className="placeholder-icon" />
                          <h3>Select your Answer</h3>
                          <p>Analyze the code snippet and select the option you think will be output to the console.</p>
                        </div>
                      </div>
                    )
                  )}

                  {isAnswerShown && (
                    <div className={`answer-validation glass ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="validation-header">
                        {isCorrect ? (
                          <><CheckCircle size={24} className="icon-success" /> <h3>Correct!</h3></>
                        ) : (
                          <><XCircle size={24} className="icon-error" /> <h3>Incorrect</h3></>
                        )}
                      </div>
                      
                      {!isCorrect && (
                        <div className="actual-output">
                          <h4>Expected Output:</h4>
                          <div className="expected-lines">
                            {selectedQuestion.expectedOutput.map((opt, i) => (
                              <div key={i} className="expected-line">
                                <span className="line-number">{i + 1}</span>
                                <span className="line-content">{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="validation-actions">
                        {!isCorrect && (
                          <button 
                            className="btn-secondary retry-btn"
                            onClick={handleReset}
                          >
                            <RotateCcw size={16} /> Try Again
                          </button>
                        )}
                        <button 
                          className="btn-primary next-btn"
                          onClick={handleNextQuestion}
                        >
                          Next Question &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OutputPredictionPage;
