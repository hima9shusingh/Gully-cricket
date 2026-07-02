import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Activity, Users, Settings } from 'lucide-react';
import { api } from '../lib/mockData';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function TeamDetailsPage() {
  const { teamId } = useParams();
  
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => api.getTeam(teamId),
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['team-players', teamId],
    queryFn: () => api.getPlayersByTeam(teamId),
  });

  if (teamLoading) return <div className="p-8 text-center animate-pulse">Loading Team...</div>;
  if (!team) return <div className="p-8 text-center text-error">Team not found!</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Link to="/teams" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
        <ChevronLeft size={16} className="mr-1" /> Back to Teams
      </Link>

      {/* Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 mb-8 shadow-lg">
        <div className="h-48 md:h-64 w-full opacity-60">
          <img src={team.banner} alt="banner" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-2 shadow-xl shrink-0 -mb-12 md:-mb-16 z-10">
            <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="flex-1 text-white z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black">{team.name}</h1>
                <p className="text-slate-300 mt-1 max-w-xl line-clamp-2">{team.description}</p>
              </div>
              <Button variant="primary" className="gap-2 bg-white text-slate-900 hover:bg-slate-200 shadow-none shrink-0">
                <Settings size={18} /> Manage Team
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* spacer for overlapping avatar */}
      <div className="h-12 md:h-16" />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBlock icon={Activity} label="Matches" value={team.stats.matches} />
        <StatBlock icon={Trophy} label="Win Rate" value={`${Math.round((team.stats.wins/team.stats.matches)*100)}%`} />
        <StatBlock icon={Activity} label="NRR" value={team.stats.nrr > 0 ? `+${team.stats.nrr}` : team.stats.nrr} valueClass={team.stats.nrr > 0 ? 'text-cricket' : 'text-error'} />
        <StatBlock icon={Trophy} label="Trophies" value={team.stats.trophies} valueClass="text-accent-yellow" />
      </div>

      {/* Squad */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users size={24} className="text-cricket" /> Squad ({players?.length || 0})</h2>
        </div>

        {playersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players?.map((player) => (
              <Card key={player.id} hoverEffect className="p-4 flex items-center gap-4 group cursor-pointer border-transparent hover:border-cricket/30 transition-colors">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-cricket transition-colors">{player.name}</h4>
                  <div className="flex items-center text-xs text-slate-500 gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-medium">{player.role}</span>
                    <span>#{player.jerseyNumber}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value, valueClass = "" }) {
  return (
    <Card className="p-4 md:p-6 bg-white dark:bg-slate-900 border-none shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className={`text-xl md:text-2xl font-black mt-1 ${valueClass}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
