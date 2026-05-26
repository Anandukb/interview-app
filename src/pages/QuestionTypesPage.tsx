import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, CheckSquare, Laptop } from 'lucide-react';
import './QuestionTypesPage.css';

const QuestionTypesPage = () => {
  const navigate = useNavigate();
  const { platform } = useParams<{ platform: string }>();

  let trackName = 'JavaScript';
  if (platform === 'node') trackName = 'Node JS';
  else if (platform === 'react') trackName = 'React';
  else if (platform === 'ts') trackName = 'TypeScript';
  else if (platform === 'html') trackName = 'HTML';
  else if (platform === 'css') trackName = 'CSS';

  const types = [
    {
      id: 'theory',
      name: 'Theory Questions',
      icon: <HelpCircle size={40} className="type-icon" />,
      desc: platform === 'node'
        ? 'Theory and core concept interview questions on Node.js.'
        : platform === 'react'
        ? 'Theory and concept-based interview questions on React.'
        : platform === 'ts'
        ? 'Theory and type-system concept interview questions on TypeScript.'
        : platform === 'html'
        ? 'Theory and semantic accessibility interview questions on HTML.'
        : platform === 'css'
        ? 'Theory and styling architecture interview questions on CSS.'
        : 'Theory and concept-based interview questions on JavaScript.'
    },
    {
      id: 'output-prediction',
      name: 'Output Prediction',
      icon: <CheckSquare size={40} className="type-icon" />,
      desc: platform === 'node'
        ? 'Predict the exact output of tricky Node.js snippets.'
        : platform === 'react'
        ? 'Predict the exact output of tricky React JSX snippets.'
        : platform === 'ts'
        ? 'Predict compile-time errors and outputs of tricky TypeScript snippets.'
        : platform === 'html'
        ? 'Predict DOM state and query outcomes of HTML operations.'
        : platform === 'css'
        ? 'Predict specificity, layout results, and computed styles of CSS properties.'
        : 'Predict the exact output of tricky JavaScript snippets.'
    },
    {
      id: 'practical',
      name: 'Practical Coding',
      icon: <Laptop size={40} className="type-icon" />,
      desc: platform === 'node'
        ? 'Hands-on backend coding challenges in Node.js.'
        : platform === 'react'
        ? 'Hands-on React coding challenges in an interactive environment.'
        : platform === 'ts'
        ? 'Hands-on TypeScript coding and type-safety challenges.'
        : platform === 'html'
        ? 'Hands-on HTML structure and DOM-tree coding challenges.'
        : platform === 'css'
        ? 'Hands-on CSS algorithm and styling layout challenges.'
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
              navigate(`/${platform}/${type.id}`);
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
