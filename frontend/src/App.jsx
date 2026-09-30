import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import VerifyEmailPage from '@/features/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';

import DashboardPage from '@/features/dashboard/DashboardPage';
import SubjectsListPage from '@/features/subjects/SubjectsListPage';
import SubjectDetailPage from '@/features/subjects/SubjectDetailPage';
import NotesListPage from '@/features/notes/NotesListPage';
import NoteDetailPage from '@/features/notes/NoteDetailPage';
import BookmarksPage from '@/features/notes/BookmarksPage';
import AnnouncementsPage from '@/features/announcements/AnnouncementsPage';
import ProfilePage from '@/features/profile/ProfilePage';

import AssignmentsListPage from '@/features/assignments/AssignmentsListPage';
import AssignmentDetailPage from '@/features/assignments/AssignmentDetailPage';

import QuizzesListPage from '@/features/quizzes/QuizzesListPage';
import QuizBuilderPage from '@/features/quizzes/QuizBuilderPage';
import QuizTakePage from '@/features/quizzes/QuizTakePage';
import QuizResultPage from '@/features/quizzes/QuizResultPage';
import QuizAttemptsPage from '@/features/quizzes/QuizAttemptsPage';
import GradeQuizAttemptPage from '@/features/quizzes/GradeQuizAttemptPage';

import AiToolsPage from '@/features/ai/AiToolsPage';

import { AdminUserListPage } from '@/features/admin/AdminUserListPage';
import AdminSettingsPage from '@/features/admin/AdminSettingsPage';

import NotFoundPage from '@/routes/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

// Logged-in users go to their dashboard.
// Logged-out users see the public landing page.
function Root() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Root />} />

      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/subjects" element={<SubjectsListPage />} />

          <Route path="/subjects/:id" element={<SubjectDetailPage />} />

          <Route path="/notes" element={<NotesListPage />} />

          <Route path="/notes/:id" element={<NoteDetailPage />} />

          <Route path="/announcements" element={<AnnouncementsPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          {/* Assignments */}
          <Route path="/assignments" element={<AssignmentsListPage />} />

          <Route path="/assignments/:id" element={<AssignmentDetailPage />} />

          {/* Quizzes */}
          <Route path="/quizzes" element={<QuizzesListPage />} />

          {/* Student quiz result */}
          <Route path="/quizzes/attempts/:attemptId/result" element={<QuizResultPage />} />

          {/* AI Tools */}
          <Route path="/ai" element={<AiToolsPage />} />
        </Route>

        {/* ========================= */}
        {/* STUDENT-ONLY ROUTES       */}
        {/* ========================= */}

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/bookmarks" element={<BookmarksPage />} />

            <Route path="/quizzes/:id/take" element={<QuizTakePage />} />
          </Route>
        </Route>

        {/* ========================= */}
        {/* TEACHER-ONLY ROUTES       */}
        {/* ========================= */}

        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route element={<DashboardLayout />}>
            {/* Create / edit quiz */}
            <Route path="/quizzes/:id/build" element={<QuizBuilderPage />} />

            {/* View all students who attempted a quiz */}
            <Route path="/quizzes/:id/attempts" element={<QuizAttemptsPage />} />
            <Route path="/quizzes/attempts/:attemptId/grade" element={<GradeQuizAttemptPage />} />
          </Route>
        </Route>

        {/* ========================= */}
        {/* ADMIN-ONLY ROUTES         */}
        {/* ========================= */}

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/teachers" element={<AdminUserListPage role="teacher" />} />

            <Route path="/admin/students" element={<AdminUserListPage role="student" />} />

            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
