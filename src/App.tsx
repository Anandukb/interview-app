import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initAdminAuth } from './store/slices/adminAuthSlice';
import { fetchAdminPlatforms, clearAdminPlatforms } from './store/slices/adminPlatformsSlice';
import {
  fetchAdminQuestionTypes,
  clearAdminQuestionTypes,
} from './store/slices/adminQuestionTypesSlice';
import {
  fetchAdminQuestions,
  clearAdminQuestions,
} from './store/slices/adminQuestionsSlice';
import {
  fetchPendingChanges,
  clearPendingChanges,
} from './store/slices/pendingChangesSlice';

import LandingPage from './pages/LandingPage';
import QuestionTypesPage from './pages/QuestionTypesPage';
import PracticalQuestionsPage from './pages/PracticalQuestionsPage';
import TheoryQuestionsPage from './pages/TheoryQuestionsPage';
import OutputPredictionPage from './pages/OutputPredictionPage';

// ── Admin pages (superadmin only) ────────────────────────────────────────────────
import AdminLogin from './admin/pages/AdminLogin';
import AdminAwaitingApproval from './admin/pages/AdminAwaitingApproval';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminPlatforms from './admin/pages/AdminPlatforms';
import AdminQuestionTypes from './admin/pages/AdminQuestionTypes';
import AdminQuestions from './admin/pages/AdminQuestions';
import AdminSeed from './admin/pages/AdminSeed';
import AdminPendingChanges from './admin/pages/AdminPendingChanges';
import AdminContributors from './admin/pages/AdminContributors';
import AdminLayout from './admin/components/AdminLayout';

// ── Contributor pages (own portal — reuses the same content pages above) ────────
import ContributorLogin from './contributor/pages/ContributorLogin';
import ContributorSignup from './contributor/pages/ContributorSignup';
import ContributorDashboard from './contributor/pages/ContributorDashboard';
import ContributorLayout from './contributor/components/ContributorLayout';

// ── Protected routes — strictly separated by role ────────────────────────────────
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = useAppSelector((s) => s.adminAuth);
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (role === 'contributor') return <Navigate to="/contributor/dashboard" replace />;
  if (role !== 'superadmin') return <AdminAwaitingApproval role={role} />;
  return <AdminLayout>{children}</AdminLayout>;
};

const ProtectedContributorRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = useAppSelector((s) => s.adminAuth);
  if (!isAuthenticated) return <Navigate to="/contributor/login" replace />;
  if (role === 'superadmin') return <Navigate to="/admin/dashboard" replace />;
  if (role !== 'contributor') return <AdminAwaitingApproval role={role} />;
  return <ContributorLayout>{children}</ContributorLayout>;
};

// ── App ────────────────────────────────────────────────────────────────────────

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, role } = useAppSelector((s) => s.adminAuth);
  const isApproved = role === 'contributor' || role === 'superadmin';

  // ── Boot: restore admin session from localStorage ────────────────────────────
  useEffect(() => {
    dispatch(initAdminAuth());
  }, [dispatch]);

  // ── Fetch / clear admin data in step with auth state ────────────────────────
  useEffect(() => {
    if (isAuthenticated && isApproved) {
      dispatch(fetchAdminPlatforms());
      dispatch(fetchAdminQuestionTypes());
      dispatch(fetchAdminQuestions());
      dispatch(fetchPendingChanges());
    } else {
      dispatch(clearAdminPlatforms());
      dispatch(clearAdminQuestionTypes());
      dispatch(clearAdminQuestions());
      dispatch(clearPendingChanges());
    }
  }, [isAuthenticated, isApproved, dispatch]);

  return (
    <div className="app-container">
      <Routes>
        {/* ── Main app ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/:platform" element={<QuestionTypesPage />} />
        <Route path="/:platform/practical" element={<PracticalQuestionsPage />} />
        <Route path="/:platform/theory" element={<TheoryQuestionsPage />} />
        <Route path="/:platform/output-prediction" element={<OutputPredictionPage />} />

        {/* ── Admin (superadmin only) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/platforms" element={<ProtectedAdminRoute><AdminPlatforms /></ProtectedAdminRoute>} />
        <Route path="/admin/question-types" element={<ProtectedAdminRoute><AdminQuestionTypes /></ProtectedAdminRoute>} />
        <Route path="/admin/questions" element={<ProtectedAdminRoute><AdminQuestions /></ProtectedAdminRoute>} />
        <Route path="/admin/pending-changes" element={<ProtectedAdminRoute><AdminPendingChanges /></ProtectedAdminRoute>} />
        <Route path="/admin/contributors" element={<ProtectedAdminRoute><AdminContributors /></ProtectedAdminRoute>} />
        <Route path="/admin/seed" element={<ProtectedAdminRoute><AdminSeed /></ProtectedAdminRoute>} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />

        {/* ── Contributor portal ── */}
        <Route path="/contributor/login" element={<ContributorLogin />} />
        <Route path="/contributor/signup" element={<ContributorSignup />} />
        <Route path="/contributor/dashboard" element={<ProtectedContributorRoute><ContributorDashboard /></ProtectedContributorRoute>} />
        <Route path="/contributor/questions" element={<ProtectedContributorRoute><AdminQuestions /></ProtectedContributorRoute>} />
        <Route path="/contributor/platforms" element={<ProtectedContributorRoute><AdminPlatforms /></ProtectedContributorRoute>} />
        <Route path="/contributor/question-types" element={<ProtectedContributorRoute><AdminQuestionTypes /></ProtectedContributorRoute>} />
        <Route path="/contributor/pending-changes" element={<ProtectedContributorRoute><AdminPendingChanges /></ProtectedContributorRoute>} />
        <Route path="/contributor" element={<Navigate to="/contributor/login" replace />} />
        <Route path="/contributor/*" element={<Navigate to="/contributor/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
