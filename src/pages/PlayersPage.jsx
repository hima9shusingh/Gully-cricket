import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { api } from '../lib/mockData';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: api.getPlayers,
  });

  const filteredPlayers = players?.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) || (player.teamId?.teamName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All'; // Roles not supported in backend yet
    return matchesSearch && matchesRole;
  }).slice(0, 100); // Limit to 100 for performance demo

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Players Directory</h2>
          <p className="text-slate-500">Discover and analyze top talent across the league.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search players by name or team..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cricket/50 transition-shadow"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'].map(role => (
            <Button 
              key={role}
              variant={roleFilter === role ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter(role)}
              className="whitespace-nowrap"
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800 h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredPlayers?.map((player) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/players/${player._id || player.id}`}>
                <Card hoverEffect className="group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                      <img src={`https://ui-avatars.com/api/?name=${player.name}&background=random`} alt={player.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-cricket transition-colors">{player.name}</h3>
                      <p className="text-xs text-slate-500 truncate mb-2">{player.teamId?.teamName || 'Free Agent'}</p>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-medium">
                          Player
                        </span>
                        <span className="flex items-center gap-1 text-slate-500"><Activity size={10} /> {player.runs || 0} Runs</span>
                        <span className="flex items-center gap-1 text-slate-500"><Activity size={10} /> {player.wickets || 0} Wickets</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {filteredPlayers?.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No players found matching your criteria.
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
