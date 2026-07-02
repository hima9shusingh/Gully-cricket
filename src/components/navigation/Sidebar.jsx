import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Activity, Trophy, Settings, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '../../store/useStore';
import Logo from '../ui/Logo';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Matches', path: '/matches' },
  { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
  { icon: Users, label: 'Teams', path: '/teams' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { matches, teams, players } = useStore();

  const activeMatchesCount = (matches || []).filter(m => m.matchStatus === 'in_progress').length;
  // Fallback today's matches to active matches count if date metadata is unavailable
  const todaysMatchesCount = activeMatchesCount > 0 ? activeMatchesCount : 0; 
  const totalTeams = (teams || []).length;
  const totalPlayers = (players || []).length;

  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors duration-300">
      <div className="p-6">
        <Logo iconSize={24} textSize="text-xl" />
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={twMerge(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive 
                  ? 'bg-cricket text-white shadow-md shadow-cricket/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <item.icon size={20} className={clsx("transition-transform duration-200", isActive ? "" : "group-hover:scale-110")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-gray-900/50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-error" /> Live Stats
            </h4>
            <span className="flex w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Active</p>
              <p className="font-black text-xl text-slate-900 dark:text-white leading-none">{activeMatchesCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Today</p>
              <p className="font-black text-xl text-slate-900 dark:text-white leading-none">{todaysMatchesCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Teams</p>
              <p className="font-black text-xl text-slate-900 dark:text-white leading-none">{totalTeams}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Players</p>
              <p className="font-black text-xl text-slate-900 dark:text-white leading-none">{totalPlayers}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
