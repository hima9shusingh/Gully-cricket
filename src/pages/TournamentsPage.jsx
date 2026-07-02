import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, Plus, Users, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const TournamentsPage = () => {
  const { tournaments, teams, createTournament } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleCreateTournament = (e) => {
    e.preventDefault();
    if (!newTournamentName || selectedTeams.length < 2) {
      alert('Please enter a name and select at least 2 teams.');
      return;
    }
    
    const selectedTeamObjects = teams.filter(t => selectedTeams.includes(t.id));
    createTournament({ name: newTournamentName, teams: selectedTeamObjects });
    setShowCreateModal(false);
    setNewTournamentName('');
    setSelectedTeams([]);
  };

  const toggleTeamSelection = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Tournaments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your leagues and series
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {showCreateModal && (
        <Card className="border-primary-500/20 shadow-lg">
          <CardHeader>
            <CardTitle>Create New Tournament</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tournament Name
                </label>
                <input
                  type="text"
                  required
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  placeholder="e.g. Gully Premier League"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Participating Teams (Min. 2)
                </label>
                {teams.length === 0 ? (
                  <p className="text-sm text-red-500">You need to create teams first!</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {teams.map(team => (
                      <div
                        key={team.id}
                        onClick={() => toggleTeamSelection(team.id)}
                        className={`cursor-pointer p-3 rounded-xl border ${
                          selectedTeams.includes(team.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        } transition-all duration-200 flex items-center justify-center text-center font-medium text-sm hover:border-primary-300`}
                      >
                        {team.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={!newTournamentName || selectedTeams.length < 2}>
                  Start Tournament
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!tournaments || tournaments.length === 0) ? (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg">No tournaments found.</p>
            <p className="text-sm">Create one to get started!</p>
          </div>
        ) : (
          tournaments.map(t => (
            <Card key={t.id} className="hover:shadow-lg transition-shadow group cursor-pointer" hoverEffect>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{t.name}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    t.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    t.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    {t.teams.length} Teams Participating
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t.matches.length} Matches Played
                  </div>
                </div>
                <div className="mt-6">
                  <a href={`/tournaments/${t.id}`} className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700">
                    View Dashboard
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
