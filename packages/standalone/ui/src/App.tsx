import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicPage } from './pages/PublicPage';
import { FounderPage } from './pages/FounderPage';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public revenue page */}
        <Route path="/" element={<PublicPage />} />

        {/* Founder page */}
        <Route path="/founder" element={<FounderPage />} />

        {/* Onboarding flow */}
        <Route path="/onboarding" element={<OnboardingGuard />} />

        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard/*" element={<ProtectedRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

// Guard for onboarding - redirects if already onboarded
function OnboardingGuard() {
  const { isOnboarded, loading } = useOnboarding();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isOnboarded) {
    return <Navigate to="/login" replace />;
  }

  return <OnboardingPage />;
}

// Protected route guard - redirects to login if not authenticated
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const { isOnboarded, loading: onboardingLoading } = useOnboarding();

  if (loading || onboardingLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
}

export default App;
