import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import BottomNav from '../components/navigation/BottomNav';
import { useStore } from '../store/useStore';
import { Moon, Sun, Bell, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '../components/ui/SplashScreen';
import Logo from '../components/ui/Logo';

export default function MainLayout() {
  const { theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isAppLoaded, setIsAppLoaded] = useState(() => {
    return sessionStorage.getItem('splashShown') === 'true';
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setIsAppLoaded(true);
    
    // Automatically navigate to dashboard after splash
    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    // If navigation fails or we end up on root with splash already shown, fallback to Dashboard
    if (isAppLoaded && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAppLoaded, location.pathname, navigate]);

  return (
    <>
      <AnimatePresence>
        {!isAppLoaded && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        {/* Desktop/Tablet Sidebar */}
        {isAppLoaded && (
          <motion.div 
            className="hidden md:block h-full"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <Sidebar />
          </motion.div>
        )}

        {/* Main Content Area */}
        {isAppLoaded && (
          <motion.div 
            className="flex-1 flex flex-col h-full overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Sticky Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 glass md:px-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <Menu size={24} className="text-slate-700 dark:text-slate-300" />
                </button>
                <div className="md:hidden">
                  <Logo iconSize={20} textSize="text-lg" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden md:block">Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                  <Bell size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cricket to-cricket-dark shadow-md text-white flex items-center justify-center font-bold ml-2">
                  U
                </div>
              </div>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0 p-4 md:p-8">
              <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-200 dark:border-slate-700 pb-safe">
              <BottomNav />
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
