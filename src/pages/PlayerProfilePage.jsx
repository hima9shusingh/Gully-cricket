import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Award, Activity, Target } from 'lucide-react';
import { api } from '../lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function PlayerProfilePage() {
  const { playerId } = useParams();
  
  const { data: player, isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => api.getPlayer(playerId),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Player...</div>;
  if (!player) return <div className="p-8 text-center text-error">Player not found!</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to="/players" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
        <ChevronLeft size={16} className="mr-1" /> Back to Players
      </Link>

      <Card className="mb-8 border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-cricket/20 overflow-hidden shadow-xl shrink-0">
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="inline-block px-3 py-1 bg-cricket/10 text-cricket rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {player.role}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-3">
              {player.name}
              <span className="text-xl md:text-2xl text-slate-300 font-bold">#{player.jerseyNumber}</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium mb-4">{player.teamName} • {player.age} yrs</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="flex items-center gap-1 text-sm bg-accent-yellow/10 text-accent-yellow px-3 py-1.5 rounded-lg font-bold">
                <Award size={16} /> Player of Match: 4
              </span>
              <span className="flex items-center gap-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold">
                <Activity size={16} /> Matches: 42
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity size={20} className="text-cricket" /> Batting Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4">
            <StatItem label="Career Runs" value={player.stats.careerRuns} />
            <StatItem label="Highest Score" value={`${player.stats.highestScore}*`} />
            <StatItem label="Average" value={player.stats.average} />
            <StatItem label="Strike Rate" value={player.stats.strikeRate} />
            <StatItem label="100s / 50s" value={`${Math.floor(player.stats.careerRuns / 1000)} / ${Math.floor(player.stats.careerRuns / 400)}`} />
            <StatItem label="Boundaries" value={`${Math.floor(player.stats.careerRuns * 0.15)} Fours`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target size={20} className="text-blue-500" /> Bowling Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4">
            <StatItem label="Wickets" value={player.stats.wickets} />
            <StatItem label="Best Bowling" value={player.stats.bestBowling} />
            <StatItem label="Economy" value={player.stats.economy} />
            <StatItem label="Maidens" value={Math.floor(player.stats.wickets * 0.4)} />
            <StatItem label="5W Hauls" value={Math.floor(player.stats.wickets / 25)} />
            <StatItem label="Hat-tricks" value={player.stats.wickets > 50 ? 1 : 0} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
