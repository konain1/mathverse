import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

// Each page is its own chunk; topic scenes are lazy-loaded again inside (see topics/registry.ts).
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const TopicPage = lazy(() => import('@/pages/TopicPage'));
const SandboxPage = lazy(() => import('@/pages/SandboxPage'));
const TopicPlayPage = lazy(() => import('@/pages/TopicPlayPage'));
const BasicsPage = lazy(() => import('@/pages/BasicsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell workspace />}>
          <Route path="/build" element={<SandboxPage />} />
          <Route path="/basics/:family/:conceptId?" element={<BasicsPage />} />
          <Route path="/topic/:topicId/q/:questionId" element={<TopicPlayPage />} />
        </Route>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
