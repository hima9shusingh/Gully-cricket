import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LiveScoring from './pages/LiveScoring';
import TeamsPage from './pages/TeamsPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import PlayersPage from './pages/PlayersPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import GroundsPage from './pages/GroundsPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailsPage from './pages/TournamentDetailsPage';

import MatchSetupPage from './pages/MatchSetupPage';
import MatchesPage from './pages/MatchesPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  const theme = useStore((state) => state.theme);
  const currentMatch = useStore((state) => state.currentMatch);

  useEffect(() => {
    const applyTheme = (currentTheme) => {
      const root = document.documentElement;
      const isDark = currentTheme === 'dark' || 
        (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', currentTheme);
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="setup" element={<MatchSetupPage />} />
            <Route path="live-scoring" element={currentMatch ? <LiveScoring /> : <Navigate to="/setup" replace />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="matches/:matchId" element={<MatchDetailsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/:teamId" element={<TeamDetailsPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="players/:playerId" element={<PlayerProfilePage />} />
            <Route path="grounds" element={<GroundsPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;

