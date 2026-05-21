import React from 'react';
import { motion } from 'framer-motion';
import './QuestionCard.css';

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    description?: string;
  };
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, isSelected, onClick, compact = false }) => {
  return (
    <motion.div 
      layout
      layoutId={`card-${question.id}`}
      className={`question-card glass-card ${isSelected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
      onClick={onClick}
      whileHover={!isSelected ? { scale: 1.02, y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="card-header">
        {question.difficulty && (
          <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
        )}
        {!compact && <span className="question-id">#{question.id}</span>}
      </div>
      <h3 className="question-title">{question.title}</h3>
      
      {!compact && question.description && (
        <p className="question-desc-short">
          {question.description.length > 80 
            ? `${question.description.substring(0, 80)}...` 
            : question.description}
        </p>
      )}
    </motion.div>
  );
};

export default QuestionCard;
