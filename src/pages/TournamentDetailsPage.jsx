import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Trophy, Calendar, Users, ListFilter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const TournamentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tournaments } = useStore();
  const [activeTab, setActiveTab] = useState('standings');
  
  const tournament = (tournaments || []).find(t => t.id === id);

  useEffect(() => {
    if (!tournament) {
      navigate('/tournaments');
    }
  }, [tournament, navigate]);

  if (!tournament) return null;

  // Calculate sorted standings
  const sortedStandings = [...tournament.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/tournaments')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            {tournament.name}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${
              tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              tournament.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {tournament.status.toUpperCase()}
            </span>
            <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {tournament.teams.length} Teams</span>
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {tournament.matches.length} Matches</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'standings'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('standings')}
        >
          <div className="flex items-center"><ListFilter className="w-4 h-4 mr-2" /> Points Table</div>
        </button>
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'matches'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('matches')}
        >
          <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Matches</div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'standings' && (
          <Card>
            <CardHeader>
              <CardTitle>Standings</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Team</th>
                    <th className="px-4 py-3 font-medium text-center">P</th>
                    <th className="px-4 py-3 font-medium text-center">W</th>
                    <th className="px-4 py-3 font-medium text-center">L</th>
                    <th className="px-4 py-3 font-medium text-center">T</th>
                    <th className="px-4 py-3 font-medium text-center">Pts</th>
                    <th className="px-4 py-3 font-medium text-center">NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStandings.map((team, index) => (
                    <tr key={team.teamId} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{team.teamName}</td>
                      <td className="px-4 py-3 text-center">{team.played}</td>
                      <td className="px-4 py-3 text-center text-green-600 dark:text-green-400">{team.won}</td>
                      <td className="px-4 py-3 text-center text-red-600 dark:text-red-400">{team.lost}</td>
                      <td className="px-4 py-3 text-center">{team.tied}</td>
                      <td className="px-4 py-3 text-center font-bold text-primary-600 dark:text-primary-400">{team.points}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs">{team.nrr > 0 ? '+' : ''}{team.nrr.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tournament Matches</h2>
              <Button onClick={() => navigate('/setup')} variant="outline" className="text-sm">
                + Add Match
              </Button>
            </div>
            {tournament.matches.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p>No matches played yet.</p>
                <Button onClick={() => navigate('/setup')} className="mt-4">
                  Start First Match
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Match history will be displayed here.</p>
              // Here we can map through tournament.matches (which are match IDs) and fetch from matches array in store
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentDetailsPage;
