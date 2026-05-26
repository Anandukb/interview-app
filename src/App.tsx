import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QuestionTypesPage from './pages/QuestionTypesPage';
import PracticalQuestionsPage from './pages/PracticalQuestionsPage';
import TheoryQuestionsPage from './pages/TheoryQuestionsPage';
import OutputPredictionPage from './pages/OutputPredictionPage';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:platform" element={<QuestionTypesPage />} />
        <Route path="/:platform/practical" element={<PracticalQuestionsPage />} />
        <Route path="/:platform/theory" element={<TheoryQuestionsPage />} />
        <Route path="/:platform/output-prediction" element={<OutputPredictionPage />} />
      </Routes>
    </div>
  );
}

export default App;
