import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initAdminAuth } from './store/slices/adminAuthSlice';
import { fetchAdminPlatforms, clearAdminPlatforms } from './store/slices/adminPlatformsSlice';

import LandingPage from './pages/LandingPage';
import QuestionTypesPage from './pages/QuestionTypesPage';
import PracticalQuestionsPage from './pages/PracticalQuestionsPage';
import TheoryQuestionsPage from './pages/TheoryQuestionsPage';
import OutputPredictionPage from './pages/OutputPredictionPage';

// ── Admin pages ────────────────────────────────────────────────────────────────
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminPlatforms from './admin/pages/AdminPlatforms';
import AdminQuestionTypes from './admin/pages/AdminQuestionTypes';
import AdminQuestions from './admin/pages/AdminQuestions';
import AdminLayout from './admin/components/AdminLayout';

// ── Protected admin route ──────────────────────────────────────────────────────
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector((s) => s.adminAuth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AdminWithLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedAdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedAdminRoute>
);

// ── App ────────────────────────────────────────────────────────────────────────

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.adminAuth.isAuthenticated);

  // ── Boot: restore admin session from localStorage ────────────────────────────
  useEffect(() => {
    dispatch(initAdminAuth());
  }, [dispatch]);

  // ── Fetch / clear admin platforms in step with auth state ────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAdminPlatforms());
    } else {
      dispatch(clearAdminPlatforms());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="app-container">
      <Routes>
        {/* ── Main app ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/:platform" element={<QuestionTypesPage />} />
        <Route path="/:platform/practical" element={<PracticalQuestionsPage />} />
        <Route path="/:platform/theory" element={<TheoryQuestionsPage />} />
        <Route path="/:platform/output-prediction" element={<OutputPredictionPage />} />

        {/* ── Admin ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminWithLayout><AdminDashboard /></AdminWithLayout>} />
        <Route path="/admin/platforms" element={<AdminWithLayout><AdminPlatforms /></AdminWithLayout>} />
        <Route path="/admin/question-types" element={<AdminWithLayout><AdminQuestionTypes /></AdminWithLayout>} />
        <Route path="/admin/questions" element={<AdminWithLayout><AdminQuestions /></AdminWithLayout>} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
