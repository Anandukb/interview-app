import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theoryQuestions } from '../data/parsedQuestions';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './TheoryQuestionsPage.css';

const renderFormattedAnswer = (text: string) => {
  // Split the text by code blocks (e.g. ```js [code] ```)
  const blocks = text.split(/(```js[\s\S]*?```|```[\s\S]*?```)/g);
  
  return blocks.map((block, index) => {
    if (block.startsWith('```')) {
      const lines = block.split('\n');
      const codeLines = lines.slice(1, -1);
      const codeContent = codeLines.join('\n');
      
      return (
        <pre key={index} className="answer-code-block">
          <code>{codeContent}</code>
        </pre>
      );
    }
    
    const inlineParts = block.split(/(`[^`]+`)/g);
    
    return (
      <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
        {inlineParts.map((part, subIndex) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={subIndex} className="answer-inline-code">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        })}
      </span>
    );
  });
};

const TheoryQuestionsPage = () => {
  const navigate = useNavigate();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleQuestion = (id: string) => {
    const newOpenIds = new Set(openIds);
    if (newOpenIds.has(id)) {
      newOpenIds.delete(id);
    } else {
      newOpenIds.add(id);
    }
    setOpenIds(newOpenIds);
  };

  return (
    <div className="theory-container container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/js')}>
          &larr; Back to Formats
        </button>
        <h1 className="title">Theory <span className="gradient-text">Questions</span></h1>
      </div>

      <div className="theory-list">
        {theoryQuestions.map((q, index) => {
          const isOpen = openIds.has(q.id);
          return (
            <div key={q.id} className={`theory-card glass-card ${isOpen ? 'open' : ''}`}>
              <div className="theory-header" onClick={() => toggleQuestion(q.id)}>
                <div className="question-title">
                  <span className="q-number">{index + 1}.</span> {q.question}
                </div>
                <button className="toggle-btn">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              
              {isOpen && (
                <div className="theory-answer">
                  <div className="answer-content">
                    {renderFormattedAnswer(q.answer)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TheoryQuestionsPage;
