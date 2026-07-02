import { Link, useLocation } from 'react-router-dom';
import { Home, Users, PlusCircle, Trophy, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
  { icon: PlusCircle, label: 'Score', path: '/live-scoring', isMain: true },
  { icon: Users, label: 'Teams', path: '/teams' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-around px-2 py-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        
        if (item.isMain) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 bg-cricket text-white rounded-full shadow-lg shadow-cricket/30 transition-transform active:scale-95 z-50"
            >
              <item.icon size={28} />
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              "flex flex-col items-center justify-center w-16 py-1 transition-colors",
              isActive ? "text-cricket" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <item.icon size={22} className={clsx("mb-1 transition-transform", isActive && "scale-110")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
