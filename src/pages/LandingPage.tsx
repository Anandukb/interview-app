import { useNavigate } from 'react-router-dom';
import { Code2, Atom, LayoutTemplate, Server } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const languages = [
    {
      id: 'html',
      name: 'HTML',
      icon: <LayoutTemplate size={48} className="lang-icon html" />,
      color: '#e34f26',
      desc: 'Master the skeleton of the web.'
    },
    {
      id: 'css',
      name: 'CSS',
      icon: <Code2 size={48} className="lang-icon css" />,
      color: '#264de4',
      desc: 'Style and animate your components.'
    },
    {
      id: 'js',
      name: 'React JS',
      icon: <Atom size={48} className="lang-icon react" />,
      color: '#61dafb',
      desc: 'Master components, state, hooks, and rendering.'
    },
    {
      id: 'node',
      name: 'Node JS',
      icon: <Server size={48} className="lang-icon node" />,
      color: '#339933',
      desc: 'Master Event Loop, streams, processes, and APIs.'
    }
  ];

  return (
    <div className="landing-container container">
      <div className="hero-section">
        <div className="badge glass">Interview Prep</div>
        <h1 className="hero-title">
          Master Frontend <span className="gradient-text">Interviews</span>
        </h1>
        <p className="hero-subtitle">
          Select a track below to start practicing real-world interview questions with our interactive compiler.
        </p>
      </div>

      <div className="language-grid">
        {languages.map(lang => (
          <div
            key={lang.id}
            className="lang-card glass-card"
            onClick={() => {
              if (lang.id === 'js' || lang.id === 'node') {
                navigate(`/${lang.id}`);
              } else {
                alert('Coming soon!');
              }
            }}
            style={{ '--hover-color': lang.color } as React.CSSProperties}
          >
            <div className="icon-wrapper glass">
              {lang.icon}
            </div>
            <h2>{lang.name}</h2>
            <p>{lang.desc}</p>
            <div className="card-footer">
              <span className="btn-secondary small">Start Practice</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
