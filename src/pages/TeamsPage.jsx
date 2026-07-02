import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Plus, Trophy, Activity, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/mockData';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function TeamsPage() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Teams</h2>
          <p className="text-slate-500">Manage and explore tournament franchises.</p>
        </div>
        <Button className="w-full md:w-auto gap-2 shadow-lg shadow-cricket/20">
          <Plus size={18} /> Create Team
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search teams..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cricket/50 transition-shadow"
          />
        </div>
        <Button variant="outline" className="px-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Filter size={20} />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800 h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {teams?.map((team) => (
            <motion.div
              key={team._id || team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link to={`/teams/${team._id || team.id}`}>
                <Card hoverEffect className="h-full group">
                  <div className="h-24 bg-slate-100 dark:bg-slate-800 relative">
                    <img src={team.banner || `https://ui-avatars.com/api/?name=${team.teamName || 'Team'}&background=random`} alt="banner" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl bg-white dark:bg-slate-900 p-1 shadow-lg">
                      <img src={team.logo || `https://ui-avatars.com/api/?name=${team.teamName || 'Team'}&background=random`} alt={team.teamName} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  </div>
                  <CardContent className="pt-10">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{team.teamName || team.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px]">{team.description || 'No description available.'}</p>
                    
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Activity size={12}/> M</div>
                        <div className="font-bold">{team.matchesPlayed || 0}</div>
                      </div>
                      <div className="text-center border-x border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-500 flex items-center justify-center gap-1">W/L</div>
                        <div className="font-bold text-cricket">{team.wins || 0}<span className="text-slate-400 font-normal">/{team.losses || 0}</span></div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Trophy size={12}/> Pts</div>
                        <div className="font-bold text-accent-yellow">{team.points || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
