import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, CheckSquare, Laptop, ArrowLeft, ArrowRight } from 'lucide-react';
import './QuestionTypesPage.css';

const PLATFORM_INFO: Record<string, { name: string; color: string }> = {
  js:           { name: 'JavaScript',   color: '#f7df1e' },
  javascript:   { name: 'JavaScript',   color: '#f7df1e' },
  node:         { name: 'Node JS',      color: '#4ade80' },
  nodejs:       { name: 'Node JS',      color: '#4ade80' },
  react:        { name: 'React',        color: '#61dafb' },
  reactjs:      { name: 'React',        color: '#61dafb' },
  'react-native': { name: 'React Native', color: '#61dafb' },
  ts:           { name: 'TypeScript',   color: '#3178c6' },
  tsx:          { name: 'TypeScript',   color: '#3178c6' },
  typescript:   { name: 'TypeScript',   color: '#3178c6' },
  html:         { name: 'HTML',         color: '#e34f26' },
  css:          { name: 'CSS',          color: '#6293f6' },
};

const TYPE_ACCENTS: Record<string, string> = {
  theory: '#a78bfa',
  'output-prediction': '#f59e0b',
  practical: '#22d3ee',
};

const QuestionTypesPage = () => {
  const navigate = useNavigate();
  const { platform } = useParams<{ platform: string }>();

  const platformKey = platform?.toLowerCase() ?? '';
  const trackInfo = PLATFORM_INFO[platformKey] ?? { name: 'JavaScript', color: '#a78bfa' };

  const types = [
    {
      id: 'theory',
      name: 'Theory Questions',
      tag: 'Concepts',
      icon: <HelpCircle size={26} />,
      desc: platform === 'node'
        ? 'Theory and core concept interview questions on Node.js.'
        : platform === 'react'
        ? 'Theory and concept-based interview questions on React.'
        : platform === 'react-native'
        ? 'Theory and concept-based interview questions on React Native.'
        : platform === 'ts'
        ? 'Theory and type-system concept interview questions on TypeScript.'
        : platform === 'html'
        ? 'Theory and semantic accessibility interview questions on HTML.'
        : platform === 'css'
        ? 'Theory and styling architecture interview questions on CSS.'
        : 'Theory and concept-based interview questions on JavaScript.',
    },
    {
      id: 'output-prediction',
      name: 'Output Prediction',
      tag: 'Tricky',
      icon: <CheckSquare size={26} />,
      desc: platform === 'node'
        ? 'Predict the exact output of tricky Node.js snippets.'
        : platform === 'react'
        ? 'Predict the exact output of tricky React JSX snippets.'
        : platform === 'react-native'
        ? 'Predict the exact output of tricky React Native snippets.'
        : platform === 'ts'
        ? 'Predict compile-time errors and outputs of tricky TypeScript snippets.'
        : platform === 'html'
        ? 'Predict DOM state and query outcomes of HTML operations.'
        : platform === 'css'
        ? 'Predict specificity, layout results, and computed styles of CSS properties.'
        : 'Predict the exact output of tricky JavaScript snippets.',
    },
    {
      id: 'practical',
      name: 'Practical Coding',
      tag: 'Hands-on',
      icon: <Laptop size={26} />,
      desc: platform === 'node'
        ? 'Hands-on backend coding challenges in Node.js.'
        : platform === 'react'
        ? 'Hands-on React coding challenges in an interactive environment.'
        : platform === 'react-native'
        ? 'Hands-on React Native coding challenges.'
        : platform === 'ts'
        ? 'Hands-on TypeScript coding and type-safety challenges.'
        : platform === 'html'
        ? 'Hands-on HTML structure and DOM-tree coding challenges.'
        : platform === 'css'
        ? 'Hands-on CSS algorithm and styling layout challenges.'
        : 'Hands-on JavaScript coding challenges in an interactive environment.',
    },
  ].filter((type) => {
    if (platform === 'react-native') return type.id === 'theory';
    return true;
  });

  return (
    <div
      className="types-page"
      style={{ '--track-color': trackInfo.color } as React.CSSProperties}
    >
      <div className="bg-glow bg-glow-1" aria-hidden />
      <div className="bg-glow bg-glow-2" aria-hidden />

      <div className="types-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Back to Languages</span>
        </button>

        <header className="types-header">
          <div className="track-pill">
            <span className="track-dot" />
            {trackInfo.name}
          </div>
          <h1 className="types-title">
            {trackInfo.name} <span className="gradient-text">Practice</span>
          </h1>
          <p className="types-subtitle">
            Pick a format to start practicing. Mix and match to round out your prep.
          </p>
        </header>

        <div className="types-grid">
          {types.map((type) => {
            const accent = TYPE_ACCENTS[type.id] ?? trackInfo.color;
            return (
              <button
                type="button"
                key={type.id}
                className="type-card glass-card"
                style={{ '--accent': accent } as React.CSSProperties}
                onClick={() => navigate(`/${platform}/${type.id}`)}
                aria-label={`Open ${type.name}`}
              >
                <div className="type-card-top">
                  <div className="type-icon-wrapper">{type.icon}</div>
                  <span className="type-tag">{type.tag}</span>
                </div>
                <h2>{type.name}</h2>
                <p>{type.desc}</p>
                <span className="type-cta">
                  Start
                  <ArrowRight size={14} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionTypesPage;
