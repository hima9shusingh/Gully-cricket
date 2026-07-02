import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function MatchDetailsPage() {
  const { matchId } = useParams();
  const { matches } = useStore();
  
  const match = (matches || []).find(m => m.id === matchId);

  if (!match) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Match Not Found</h2>
        <Link to="/matches">
          <Button variant="outline"><ArrowLeft className="mr-2" size={18} /> Back to Matches</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/matches" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Match Summary</h1>
      </div>

      <Card className="bg-cricket text-white border-none shadow-xl shadow-cricket/20 overflow-hidden relative">
        <CardContent className="p-6 sm:p-8 text-center relative z-10">
          <Trophy size={48} className="mx-auto text-yellow-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{match.matchResult}</h2>
          <p className="text-cricket-100 uppercase tracking-widest text-sm font-bold">{match.ground}</p>
        </CardContent>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full -ml-24 -mb-24" />
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{match.battingTeam?.name} (1st Innings)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-4">
              {match.firstInningsScore}/{match.firstInningsWickets} <span className="text-lg text-slate-500 font-bold">({match.oversTotal} ov)</span>
            </div>
            <p className="text-sm text-slate-500 italic">Detailed scorecard requires database expansion in v2.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{match.bowlingTeam?.name} (2nd Innings)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-4">
              {match.score}/{match.wickets} <span className="text-lg text-slate-500 font-bold">({Math.floor((match.balls||0)/6)}.{(match.balls||0)%6} ov)</span>
            </div>
            <p className="text-sm text-slate-500 italic">Detailed scorecard requires database expansion in v2.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
