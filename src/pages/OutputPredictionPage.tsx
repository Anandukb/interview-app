import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { outputPredictionQuestions } from '../data/parsedQuestions';
import Editor from '@monaco-editor/react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import './OutputPredictionPage.css';

const OutputPredictionPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOutput, setSelectedOutput] = useState<string[]>([]);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const question = outputPredictionQuestions[currentIndex];

  useEffect(() => {
    // Reset state when question changes
    setSelectedOutput([]);
    setIsAnswerShown(false);
    setIsCorrect(null);
  }, [currentIndex]);

  if (!question) return <div>Loading...</div>;

  const availableOptions = question.options.filter(opt => !selectedOutput.includes(opt));

  const handleSelectOption = (opt: string) => {
    if (isAnswerShown) return;
    setSelectedOutput([...selectedOutput, opt]);
  };

  const handleRemoveSelection = (index: number) => {
    if (isAnswerShown) return;
    const newSelected = [...selectedOutput];
    newSelected.splice(index, 1);
    setSelectedOutput(newSelected);
  };

  const handleShowAnswer = () => {
    const isOrderCorrect = JSON.stringify(selectedOutput) === JSON.stringify(question.expectedOutput);
    setIsCorrect(isOrderCorrect);
    setIsAnswerShown(true);
  };

  const handleReset = () => {
    setSelectedOutput([]);
    setIsAnswerShown(false);
    setIsCorrect(null);
  };

  return (
    <div className="output-prediction-container container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/js')}>
          &larr; Back to Formats
        </button>
        <h1 className="title">Output <span className="gradient-text">Prediction</span></h1>
      </div>

      <div className="prediction-layout">
        
        {/* Left Side: Code & Options */}
        <div className="left-panel">
          <div className="question-header glass">
            <h2>{currentIndex + 1}. {question.title}</h2>
          </div>

          <div className="code-viewer glass">
            <Editor
              height="300px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={question.code}
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
            <h3>Predict the Output Order</h3>
            <p className="subtitle">Click the blocks below in the exact order they will be logged to the console.</p>
            
            <div className="available-options">
              {availableOptions.map((opt, i) => (
                <button 
                  key={i} 
                  className="chip option-chip"
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerShown}
                >
                  {opt}
                </button>
              ))}
              {availableOptions.length === 0 && (
                <span className="no-options">All options selected.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: User Prediction & Answer Validation */}
        <div className="right-panel">
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
                    {question.expectedOutput.map((opt, i) => (
                      <div key={i} className="expected-line">
                        <span className="line-number">{i + 1}</span>
                        <span className="line-content">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                className="btn-secondary next-btn"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % outputPredictionQuestions.length)}
              >
                Next Question &rarr;
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OutputPredictionPage;
