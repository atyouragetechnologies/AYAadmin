import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { MascotLoader } from './components/ui/MascotLoader';
import { OtaUpdateScreen } from './components/OtaUpdateScreen';

import { lazy } from 'react';

const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.HomePage })));
const GameRoot = lazy(() => import('./pages/GameRoot').then(m => ({ default: m.GameRoot })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const SigninPage = lazy(() => import('./pages/SigninPage').then(m => ({ default: m.SigninPage })));
const SignupCompletePage = lazy(() => import('./pages/SignupCompletePage').then(m => ({ default: m.SignupCompletePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const JournalPage = lazy(() => import('./pages/JournalPage').then(m => ({ default: m.JournalPage })));
const ThemeSwitcherPage = lazy(() => import('./pages/ThemeSwitcherPage').then(m => ({ default: m.ThemeSwitcherPage })));
const NotificationOnboardingPage = lazy(() => import('./pages/NotificationOnboardingPage').then(m => ({ default: m.NotificationOnboardingPage })));
const SocialPage = lazy(() => import('./pages/SocialPage').then(m => ({ default: m.SocialPage })));
const PaymentVerify = lazy(() => import('./pages/PaymentVerify').then(m => ({ default: m.PaymentVerify })));

const OnboardingWizard = lazy(() => import('./components/game/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const CinematicOnboarding = lazy(() => import('./components/game/CinematicOnboarding').then(m => ({ default: m.CinematicOnboarding })));
const PersonalityAssessment = lazy(() => import('./components/game/PersonalityAssessment').then(m => ({ default: m.PersonalityAssessment })));
const FeedbackDashboard = lazy(() => import('./components/admin/FeedbackDashboard').then(m => ({ default: m.FeedbackDashboard })));

import { bgmManager } from './utils/bgmManager';
import { MapRouteHandler, IntroRouteHandler, PlayRouteHandler, ReportRouteHandler, DnaRouteHandler, SelectionRouteHandler, MoodRouteHandler, DailyRevealRouteHandler, LevelUpRouteHandler, AdminRouteHandler, ProfileRouteHandler } from './pages/GameRouteHandlers';

import ReactGA from 'react-ga4';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { GoogleTranslateSync } from './components/GoogleTranslateSync';

// Initialize Google Analytics 4
ReactGA.initialize('G-30ZXCBJXSQ');

import { useNativeFeatures } from './hooks/useNativeFeatures';
import { useOtaUpdater } from './hooks/useOtaUpdater';
import { useLocation } from 'react-router-dom';

const CatchAllRedirect = ({ to }: { to: string }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />;
};

function App() {
  useNativeFeatures();

  // OTA Update check — native Android only, runs once on mount
  const { isForceUpdating, progress } = useOtaUpdater();

  useEffect(() => {
    bgmManager.loadPreference()
    
    // Unlock on user interactions (keeps audio context alive on mobile)
    const unlock = async () => {
      await bgmManager.unlock()
    }
    
    document.addEventListener('click', unlock, { capture: true, passive: true })
    document.addEventListener('touchstart', unlock, { capture: true, passive: true })
    
    return () => {
      document.removeEventListener('click', unlock, { capture: true })
      document.removeEventListener('touchstart', unlock, { capture: true })
    }
  }, [])

  // Block app UI during OTA update — mirrors CPBS ForceOtaUpdateScreen behaviour
  if (isForceUpdating) {
    return <OtaUpdateScreen progress={progress} />;
  }

  return (
    <BrowserRouter>
      <GoogleTranslateSync />
      <AnalyticsTracker />
      <Suspense fallback={<MascotLoader message="LOADING YOUR UNIVERSE..." subMessage="Syncing your timeline..." />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/signup/complete" element={<SignupCompletePage />} />
            <Route path="/payment/verify" element={<PaymentVerify />} />
            <Route path="/dashboard" element={<Navigate to="/game" replace />} />
            <Route path="/game" element={<GameRoot />}>
              <Route index element={<MapRouteHandler />} />
              <Route path="welcome" element={<OnboardingWizard />} />
              <Route path="setup" element={<OnboardingWizard />} />
              <Route path="notifications" element={<NotificationOnboardingPage />} />
              <Route path="onboarding/:step" element={<CinematicOnboarding />} />
              <Route path="onboarding" element={<Navigate to="/game/onboarding/1" replace />} />
              <Route path="assessment/:step" element={<PersonalityAssessment />} />
              <Route path="intro/:id" element={<IntroRouteHandler />} />
              <Route path="play/:id" element={<PlayRouteHandler />} />
              <Route path="report/:id" element={<ReportRouteHandler />} />
              <Route path="dna" element={<DnaRouteHandler />} />
              <Route path="profile" element={<ProfileRouteHandler />} />
              <Route path="selection/:age" element={<SelectionRouteHandler />} />
              <Route path="mood" element={<MoodRouteHandler />} />
              <Route path="daily-reveal" element={<DailyRevealRouteHandler />} />
              <Route path="level-up" element={<LevelUpRouteHandler />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="journal" element={<JournalPage />} />
              <Route path="theme" element={<ThemeSwitcherPage />} />
              <Route path="social" element={<SocialPage />} />
              <Route path="admin" element={<AdminRouteHandler />} />
              <Route path="admin/feedback" element={<FeedbackDashboard />} />
              <Route path="*" element={<CatchAllRedirect to="/game" />} />
            </Route>
            <Route path="*" element={<CatchAllRedirect to="/" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
