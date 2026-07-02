import { useStore } from '../store/useStore';
import { Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Link } from 'react-router-dom';

export default function MatchesPage() {
  const { matches } = useStore();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Activity className="text-cricket" /> Match History
        </h1>
        <p className="text-slate-500 mt-2">View all past matches and results.</p>
      </div>

      <div className="space-y-4">
        {(!matches || matches.length === 0) ? (
          <Card className="border-dashed bg-slate-50 dark:bg-slate-900/50">
             <CardContent className="py-16 text-center">
               <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Calendar size={32} />
               </div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Matches Yet</h2>
               <p className="text-slate-500 max-w-sm mx-auto mb-6">
                 Start a match from the Match Setup page to see it recorded here.
               </p>
               <Link to="/setup" className="inline-flex items-center justify-center px-6 py-3 bg-cricket text-white rounded-full font-bold hover:bg-cricket-dark transition-colors">
                 Start a Match
               </Link>
             </CardContent>
          </Card>
        ) : (
          [...matches].reverse().map((m) => {
            const battingTeam = m.battingFirst?._id === m.teamA?._id ? m.teamA : (m.battingFirst?._id === m.teamB?._id ? m.teamB : m.battingFirst);
            const bowlingTeam = battingTeam?._id === m.teamA?._id ? m.teamB : m.teamA;
            
            return (
            <Link to={`/matches/${m._id}`} key={m._id} className="block group">
              <Card hoverEffect className="transition-all duration-200 group-hover:border-cricket/50">
                <CardHeader className="py-3 px-4 sm:px-6">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="uppercase tracking-wide">{m.tournament ? 'Tournament Match' : 'Friendly'} • {m.ground || 'Local Ground'}</span>
                  </div>
                </CardHeader>
                <CardContent className="py-4 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1 w-full flex items-center justify-between sm:justify-start sm:gap-8">
                      <div className="text-center sm:text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white">{battingTeam?.teamName || battingTeam?.name || 'Team 1'}</h3>
                        <div className="text-2xl font-black tracking-tighter mt-1">{m.firstInningsScore || 0}/{m.firstInningsWickets || 0}</div>
                      </div>
                      <div className="text-sm font-bold text-slate-400 hidden sm:block">VS</div>
                      <div className="text-center sm:text-right">
                        <h3 className="font-bold text-slate-900 dark:text-white">{bowlingTeam?.teamName || bowlingTeam?.name || 'Team 2'}</h3>
                        <div className="text-2xl font-black tracking-tighter mt-1">{m.runs || 0}/{m.wickets || 0}</div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto text-center sm:text-right p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="text-sm font-bold text-cricket">{m.result || m.matchResult || 'Result Unknown'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )})
        )}
      </div>
    </div>
  );
}
