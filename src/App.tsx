import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

// Each page is its own chunk; topic scenes are lazy-loaded again inside (see topics/registry.ts).
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const TopicPage = lazy(() => import('@/pages/TopicPage'));
const SandboxPage = lazy(() => import('@/pages/SandboxPage'));
const TopicPlayPage = lazy(() => import('@/pages/TopicPlayPage'));
const BasicsPage = lazy(() => import('@/pages/BasicsPage'));
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
