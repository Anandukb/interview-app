import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, CheckSquare, Laptop } from 'lucide-react';
import './QuestionTypesPage.css';

const QuestionTypesPage = () => {
  const navigate = useNavigate();
  const { track } = useParams<{ track: string }>();

  const isNode = track === 'node';
  const trackName = isNode ? 'Node JS' : 'React JS';

  const types = [
    {
      id: 'theory',
      name: 'Theory Questions',
      icon: <HelpCircle size={40} className="type-icon" />,
      desc: isNode 
        ? 'Theory and core concept interview questions on Node.js.'
        : 'Theory and concept-based interview questions on JS & React.'
    },
    {
      id: 'output-prediction',
      name: 'Output Prediction',
      icon: <CheckSquare size={40} className="type-icon" />,
      desc: isNode 
        ? 'Predict the exact output of tricky Node.js snippets.'
        : 'Predict the exact output of tricky React/JS snippets.'
    },
    {
      id: 'practical',
      name: 'Practical Coding',
      icon: <Laptop size={40} className="type-icon" />,
      desc: isNode 
        ? 'Hands-on backend coding challenges in Node.js.'
        : 'Hands-on coding challenges in an interactive environment.'
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
