import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Trophy, Users, Star, ArrowRight, Medal, Calendar, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';

export default function Dashboard() {
  const { matches, teams, players, tournaments, fetchMatches, fetchTeams, fetchPlayers, fetchTournaments } = useStore();

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchPlayers();
    fetchTournaments();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  const activeMatches = (matches || []).filter(m => m.matchStatus === 'in_progress');
  const completedMatches = (matches || []).filter(m => m.matchStatus === 'completed');

  return (
    <motion.div 
      className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Quick Actions Header */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/setup" className="col-span-2 md:col-span-1">
          <div className="bg-gradient-to-br from-cricket to-cricket-dark text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-cricket/20 hover:shadow-cricket/40 transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform"><Activity size={20} /></div>
              <span className="font-bold">Start Match</span>
            </div>
            <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link to="/teams">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 text-blue-500 p-2 rounded-xl group-hover:scale-110 transition-transform"><Users size={20} /></div>
              <span className="font-bold">Add Team</span>
            </div>
          </div>
        </Link>
        <Link to="/tournaments">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3">
              <div className="bg-accent-yellow/10 text-accent-yellow p-2 rounded-xl group-hover:scale-110 transition-transform"><Trophy size={20} /></div>
              <span className="font-bold">New Tourney</span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Live Matches Carousel */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse" /> Live Now
          </h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {activeMatches.length > 0 ? activeMatches.map(match => (
            <LiveMatchCard key={match.id} match={match} />
          )) : (
            <div className="w-full bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500">
              <Zap size={32} className="mb-2 opacity-50" />
              <p className="font-medium">No live matches right now</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Recent & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <RecentUpcomingTabs completedMatches={completedMatches} />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Matches" value={(matches||[]).length} color="text-cricket" bgColor="bg-cricket/10" />
            <StatCard icon={Trophy} label="Tourneys" value={(tournaments||[]).length} color="text-accent-yellow" bgColor="bg-accent-yellow/10" />
            <StatCard icon={Users} label="Teams" value={(teams||[]).length} color="text-blue-500" bgColor="bg-blue-500/10" />
            <StatCard icon={Star} label="Players" value={(players||[]).length} color="text-purple-500" bgColor="bg-purple-500/10" />
          </motion.div>
        </div>

        {/* Right Column: Highlights & Rankings */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <TournamentHighlights />
          </motion.div>

          <motion.div variants={itemVariants}>
            <PlayerRankings />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Subcomponents
// ----------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bgColor} ${color}`}>
        <Icon size={20} />
      </div>
      <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{value}</h4>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function LiveMatchCard({ match }) {
  const battingTeam = match.battingFirst?._id === match.teamA?._id ? match.teamA : (match.battingFirst?._id === match.teamB?._id ? match.teamB : match.battingFirst);
  const bowlingTeam = battingTeam?._id === match.teamA?._id ? match.teamB : match.teamA;

  return (
    <Link to="/live-scoring" className="min-w-[300px] md:min-w-[400px] snap-center shrink-0 group" onClick={() => useStore.getState().setCurrentMatch(match)}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-cricket/50 transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-error" />
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black px-2 py-1 bg-error/10 text-error rounded text-uppercase tracking-widest uppercase">Live</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{match.ground || 'Local Ground'}</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${battingTeam?.teamName || battingTeam?.name || 'A'}&background=random`} alt="logo" className="w-full h-full object-cover" />
              </div>
              {battingTeam?.teamName || battingTeam?.name || 'Team 1'}
            </h3>
            <span className="font-black text-xl text-slate-900 dark:text-white">{match.runs || 0}/{match.wickets || 0} <span className="text-xs text-slate-400 font-bold">({match.overs || 0})</span></span>
          </div>
          
          <div className="flex justify-between items-center opacity-60">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${bowlingTeam?.teamName || bowlingTeam?.name || 'B'}&background=random`} alt="logo" className="w-full h-full object-cover" />
              </div>
              {bowlingTeam?.teamName || bowlingTeam?.name || 'Team 2'}
            </h3>
            <span className="font-black text-sm text-slate-500">{match.currentInnings === 2 ? `${match.firstInningsScore || 0}/${match.firstInningsWickets || 0}` : 'Yet to bat'}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-cricket">
          CRR: {match.oversLimit > 0 ? ((match.runs || 0) / (match.overs || 1)).toFixed(2) : '0.00'} • {battingTeam?.teamName || battingTeam?.name || 'Team'} elected to {match.tossDecision || 'bat'}
        </div>
      </div>
    </Link>
  );
}

function RecentUpcomingTabs({ completedMatches }) {
  const [activeTab, setActiveTab] = useState('recent');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('recent')}
          className={clsx("flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors", activeTab === 'recent' ? "text-cricket border-b-2 border-cricket" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}
        >
          Recent Results
        </button>
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={clsx("flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors", activeTab === 'upcoming' ? "text-cricket border-b-2 border-cricket" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}
        >
          Upcoming
        </button>
      </div>
      
      <div className="p-0">
        <AnimatePresence mode="wait">
          {activeTab === 'recent' ? (
            <motion.div key="recent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-slate-100 dark:divide-slate-800">
              {completedMatches.length > 0 ? completedMatches.slice(-3).reverse().map(m => (
                <ResultItem key={m.id} match={m} />
              )) : (
                <div className="p-8 text-center text-slate-500 text-sm">No recent matches found.</div>
              )}
              <Link to="/matches" className="block text-center py-3 text-xs font-bold text-cricket uppercase hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                View All Matches
              </Link>
            </motion.div>
          ) : (
            <motion.div key="upcoming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Mock Upcoming Matches */}
              <UpcomingItem team1="Mumbai Indians" team2="Chennai Super Kings" date="Tomorrow, 7:30 PM" />
              <UpcomingItem team1="Royal Challengers" team2="Delhi Capitals" date="Sat 25 Jun, 3:30 PM" />
              <div className="p-8 text-center text-slate-500 text-xs italic">Upcoming scheduling feature coming in v2.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultItem({ match }) {
  const battingTeam = match.battingFirst?._id === match.teamA?._id ? match.teamA : (match.battingFirst?._id === match.teamB?._id ? match.teamB : match.battingFirst);
  const bowlingTeam = battingTeam?._id === match.teamA?._id ? match.teamB : match.teamA;

  return (
    <Link to={`/matches/${match._id}`} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
        <span>{match.tournament ? 'Tournament Match' : 'Friendly T20'}</span>
        <span>{match.ground || 'Local Ground'}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-800 dark:text-slate-200">{battingTeam?.teamName || battingTeam?.name || 'Team 1'}</span>
          <span className="font-black text-sm">{match.firstInningsScore || 0}/{match.firstInningsWickets || 0}</span>
        </div>
        <div className="flex justify-between items-center opacity-70">
          <span className="font-bold text-slate-600 dark:text-slate-400">{bowlingTeam?.teamName || bowlingTeam?.name || 'Team 2'}</span>
          <span className="font-black text-sm">{match.runs || 0}/{match.wickets || 0}</span>
        </div>
      </div>
      <p className="text-xs font-bold text-cricket mt-3">{match.result || match.matchResult || 'Result Unknown'}</p>
    </Link>
  );
}

function UpcomingItem({ team1, team2, date }) {
  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
      <div className="flex-1 space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{team1}</div>
        <div className="font-bold text-slate-600 dark:text-slate-400 text-sm">{team2}</div>
      </div>
      <div className="text-right">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <Calendar size={10} /> {date}
        </span>
      </div>
    </div>
  );
}

function TournamentHighlights() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-1 shadow-lg relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cricket rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none" />
      
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[22px] p-5 h-full">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Trophy size={14} className="text-accent-yellow" /> Featured Tournament
        </h3>
        
        <h2 className="text-xl font-black text-white leading-tight mb-1">Gully Premier League 2026</h2>
        <p className="text-sm text-slate-400 mb-6">Group Stage • Matchday 4</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold bg-white/5 px-3 py-2 rounded-lg">
            <span className="flex items-center gap-2"><span className="w-1 h-1 bg-cricket rounded-full" /> Chennai Super Kings</span>
            <span className="text-cricket-100">8 pts</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold px-3 py-1">
            <span className="text-slate-300">Mumbai Indians</span>
            <span className="text-slate-400">6 pts</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold px-3 py-1">
            <span className="text-slate-300">Royal Challengers</span>
            <span className="text-slate-400">4 pts</span>
          </div>
        </div>
        
        <Link to="/tournaments" className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-bold text-white">
          View Standings <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function PlayerRankings() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <Medal size={14} className="text-blue-500" /> Top Performers
      </h3>
      
      <div className="space-y-4">
        {/* Mock Orange Cap */}
        <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-950/30 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/50">
           <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900 overflow-hidden shadow-inner">
             <img src="https://ui-avatars.com/api/?name=Virat+Kohli&background=random" alt="Player" className="w-full h-full object-cover" />
           </div>
           <div className="flex-1">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white">Virat Kohli</h4>
             <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Orange Cap</p>
           </div>
           <div className="text-right">
             <p className="font-black text-lg text-slate-900 dark:text-white leading-none">482</p>
             <p className="text-[10px] text-slate-500 font-bold uppercase">Runs</p>
           </div>
        </div>

        {/* Mock Purple Cap */}
        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/30 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/50">
           <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden shadow-inner">
             <img src="https://ui-avatars.com/api/?name=Rashid+Khan&background=random" alt="Player" className="w-full h-full object-cover" />
           </div>
           <div className="flex-1">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rashid Khan</h4>
             <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Purple Cap</p>
           </div>
           <div className="text-right">
             <p className="font-black text-lg text-slate-900 dark:text-white leading-none">18</p>
             <p className="text-[10px] text-slate-500 font-bold uppercase">Wickets</p>
           </div>
        </div>
      </div>
    </div>
  );
}
