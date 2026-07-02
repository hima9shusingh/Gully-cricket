import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { teamService, playerService, tournamentService, matchService } from '../lib/api';

export const useStore = create(
  persist(
    (set, get) => ({
      theme: (typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light') || 'light',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') localStorage.setItem('theme', newTheme);
        return { theme: newTheme };
      }),
      setTheme: (theme) => {
        if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
        set({ theme });
      },
      
      matches: [],
      teams: [],
      players: [],
      tournaments: [],
      currentMatch: null,

      fetchTeams: async () => {
        try {
          const res = await teamService.getTeams();
          set({ teams: res?.data?.data || [] });
        } catch (err) { console.error(err); }
      },

      fetchPlayers: async () => {
        try {
          const res = await playerService.getPlayers();
          set({ players: res?.data?.data || [] });
        } catch (err) { console.error(err); }
      },

      fetchTournaments: async () => {
        try {
          const res = await tournamentService.getTournaments();
          set({ tournaments: res?.data?.data || [] });
        } catch (err) { console.error(err); }
      },

      fetchMatches: async () => {
        try {
          const res = await matchService.getMatches();
          set({ matches: res?.data?.data || [] });
        } catch (err) { console.error(err); }
      },

      setCurrentMatch: (match) => set({ currentMatch: match }),
      
      addTeam: async (teamData) => {
        try {
          const res = await teamService.createTeam(teamData);
          set((state) => ({ teams: [...state.teams, res.data.data] }));
          return res.data.data;
        } catch (err) { console.error(err); throw err; }
      },

      addPlayer: async (playerData) => {
        try {
          const res = await playerService.createPlayer(playerData);
          set((state) => ({ players: [...state.players, res.data.data] }));
          return res.data.data;
        } catch (err) { console.error(err); throw err; }
      },
      
      createTournament: async (tournamentData) => {
        try {
          const res = await tournamentService.createTournament(tournamentData);
          set((state) => ({ tournaments: [...state.tournaments, res.data.data] }));
          return res.data.data;
        } catch (err) { console.error(err); throw err; }
      },

      createMatch: async (matchData) => {
        try {
          const res = await matchService.createMatch(matchData);
          set((state) => ({ matches: [...state.matches, res.data.data] }));
          return res.data.data;
        } catch (err) { console.error(err); throw err; }
      },

      // Backend API Dispatchers for Live Scoring
      startMatch: async (matchId, payload) => {
        try {
          const res = await matchService.startMatch(matchId, payload);
          set({ currentMatch: res.data.data });
        } catch (err) { console.error(err); }
      },

      addEvent: async (event) => {
        const state = get();
        if (!state.currentMatch || state.currentMatch.status !== 'Live') return;
        const matchId = get().currentMatch._id || get().currentMatch.id;
        try {
          let res;
          const { type, value, dismissalType, nextBatsmanId, nextBowlerId, dismissedBatsmanId } = event;
          const payload = { value, dismissalType, nextBatsmanId, nextBowlerId, dismissedBatsmanId };
          
          if (type === 'run') res = await matchService.addBall(matchId, payload);
          else if (type === 'wicket') res = await matchService.addWicket(matchId, payload);
          else if (type === 'wide') res = await matchService.addExtra(matchId, 'wide', payload);
          else if (type === 'noBall') res = await matchService.addExtra(matchId, 'noball', payload);
          else if (type === 'bye') res = await matchService.addExtra(matchId, 'bye', payload);
          else if (type === 'legBye') res = await matchService.addExtra(matchId, 'legbye', payload);

          if (res && res.data) {
             set({ currentMatch: res.data.data });
          }
        } catch (err) { console.error(err); }
      },

      setNewBowler: async (bowlerId) => {
        const state = get();
        if (!state.currentMatch) return;
        try {
          const matchId = state.currentMatch._id || state.currentMatch.id;
          const res = await matchService.changeBowler(matchId, { bowlerId });
          set({ currentMatch: res.data.data });
        } catch (err) { console.error(err); alert(err?.response?.data?.message || err.message); }
      },

      undo: async () => {
        const state = get();
        if (!state.currentMatch) return;
        try {
          const res = await matchService.undoBall(state.currentMatch._id);
          set({ currentMatch: res.data.data });
        } catch (err) { console.error(err); }
      },

      startSecondInnings: async (strikerId, nonStrikerId, bowlerId) => {
        const state = get();
        if (!state.currentMatch) return;
        const matchId = state.currentMatch._id || state.currentMatch.id;
        try {
          const res = await matchService.startMatch(matchId, { striker: strikerId, nonStriker: nonStrikerId, currentBowler: bowlerId });
          set({ currentMatch: res.data.data });
        } catch (err) { console.error(err); }
      },

      endInnings: async () => {
        const state = get();
        if (!state.currentMatch) return;
        try {
          const res = await matchService.endInnings(state.currentMatch._id || state.currentMatch.id);
          set({ currentMatch: res.data.data });
        } catch (err) { console.error(err); }
      },

      endMatch: async (payload) => {
        const state = get();
        if (!state.currentMatch) return;
        try {
          const res = await matchService.endMatch(state.currentMatch._id, payload);
          set({ currentMatch: res.data.data });
        } catch (err) { console.error(err); }
      },
    }),
    {
      name: 'gullycricket-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        // We do not persist massive API arrays anymore, only the theme and currentMatch id if needed.
        currentMatch: state.currentMatch
      }),
    }
  )
);
