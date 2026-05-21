import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { theoryQuestions, nodeTheoryQuestions } from '../data/parsedQuestions';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './TheoryQuestionsPage.css';

const renderInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="answer-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const renderTextBlock = (blockText: string) => {
  const lines = blockText.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const pushCurrentList = (key: string | number) => {
    if (currentList) {
      if (currentList.type === 'ul') {
        renderedElements.push(
          <ul key={key} className="answer-list">
            {currentList.items}
          </ul>
        );
      } else {
        renderedElements.push(
          <ol key={key} className="answer-list">
            {currentList.items}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) {
      pushCurrentList(`list-close-${lineIndex}`);
      return;
    }

    // Check for unordered list item
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (ulMatch) {
      const content = ulMatch[2];
      const formattedContent = renderInlineFormatting(content);
      
      if (!currentList || currentList.type !== 'ul') {
        pushCurrentList(`list-close-${lineIndex}`);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(<li key={lineIndex}>{formattedContent}</li>);
      return;
    }

    // Check for ordered list item
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (olMatch) {
      const content = olMatch[2];
      const formattedContent = renderInlineFormatting(content);
      
      if (!currentList || currentList.type !== 'ol') {
        pushCurrentList(`list-close-${lineIndex}`);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(<li key={lineIndex}>{formattedContent}</li>);
      return;
    }

    // It's a regular paragraph line, close list if any
    pushCurrentList(`list-close-${lineIndex}`);
    
    // Check if it's a heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      renderedElements.push(
        <Tag key={lineIndex} className={`answer-h${level}`}>
          {renderInlineFormatting(content)}
        </Tag>
      );
      return;
    }

    // Otherwise standard paragraph
    renderedElements.push(
      <p key={lineIndex} className="answer-paragraph">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  pushCurrentList('list-close-final');
  return renderedElements;
};

const renderFormattedAnswer = (text: string) => {
  // Split the text by code blocks
  const blocks = text.split(/(```[a-z]*[\s\S]*?```)/gi);
  
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
    
    return <div key={index}>{renderTextBlock(block)}</div>;
  });
};

const TheoryQuestionsPage = () => {
  const navigate = useNavigate();
  const { track } = useParams<{ track: string }>();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const isNode = track === 'node';
  const questions = isNode ? nodeTheoryQuestions : theoryQuestions;
  const trackTitle = isNode ? 'Node JS' : 'Theory';

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
        <button className="back-btn" onClick={() => navigate(`/${track}`)}>
          &larr; Back to Formats
        </button>
        <h1 className="title">{trackTitle} <span className="gradient-text">Questions</span></h1>
      </div>

      <div className="theory-list">
        {questions.map((q, index) => {
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
