import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, CheckSquare, Laptop } from 'lucide-react';
import './QuestionTypesPage.css';

const QuestionTypesPage = () => {
  const navigate = useNavigate();
  const { track } = useParams<{ track: string }>();

  let trackName = 'JavaScript';
  if (track === 'node') trackName = 'Node JS';
  else if (track === 'react') trackName = 'React';
  else if (track === 'ts') trackName = 'TypeScript';

  const types = [
    {
      id: 'theory',
      name: 'Theory Questions',
      icon: <HelpCircle size={40} className="type-icon" />,
      desc: track === 'node'
        ? 'Theory and core concept interview questions on Node.js.'
        : track === 'react'
        ? 'Theory and concept-based interview questions on React.'
        : track === 'ts'
        ? 'Theory and type-system concept interview questions on TypeScript.'
        : 'Theory and concept-based interview questions on JavaScript.'
    },
    {
      id: 'output-prediction',
      name: 'Output Prediction',
      icon: <CheckSquare size={40} className="type-icon" />,
      desc: track === 'node'
        ? 'Predict the exact output of tricky Node.js snippets.'
        : track === 'react'
        ? 'Predict the exact output of tricky React JSX snippets.'
        : track === 'ts'
        ? 'Predict compile-time errors and outputs of tricky TypeScript snippets.'
        : 'Predict the exact output of tricky JavaScript snippets.'
    },
    {
      id: 'practical',
      name: 'Practical Coding',
      icon: <Laptop size={40} className="type-icon" />,
      desc: track === 'node'
        ? 'Hands-on backend coding challenges in Node.js.'
        : track === 'react'
        ? 'Hands-on React coding challenges in an interactive environment.'
        : track === 'ts'
        ? 'Hands-on TypeScript coding and type-safety challenges.'
        : 'Hands-on JavaScript coding challenges in an interactive environment.'
    }
  ];

  return (
    <div className="types-container container">
      <button className="back-btn" onClick={() => navigate('/')}>
        &larr; Back to Languages
      </button>

      <div className="header-content">
        <h1 className="title">{trackName} <span className="gradient-text">Practice</span></h1>
        <p className="subtitle">Select the format you want to practice today.</p>
      </div>

      <div className="types-grid">
        {types.map(type => (
          <div 
            key={type.id} 
            className="type-card glass-card"
            onClick={() => {
              navigate(`/${track}/${type.id}`);
            }}
          >
            <div className="icon-wrapper glass">
              {type.icon}
            </div>
            <div className="card-content">
              <h2>{type.name}</h2>
              <p>{type.desc}</p>
            </div>
            <div className="arrow">&rarr;</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionTypesPage;
