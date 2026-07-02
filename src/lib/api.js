import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const teamService = {
  getTeams: () => api.get('/teams'),
  getTeam: (id) => api.get(`/teams/${id}`),
  createTeam: (data) => api.post('/teams', data),
};

export const playerService = {
  getPlayers: () => api.get('/players'),
  getPlayer: (id) => api.get(`/players/${id}`),
  createPlayer: (data) => api.post('/players', data),
};

export const matchService = {
  getMatches: () => api.get('/matches'),
  getMatch: (id) => api.get(`/matches/${id}`),
  createMatch: (data) => api.post('/matches', data),
  
  startMatch: (id, data) => api.post(`/matches/${id}/start`, data),
  changeBowler: (id, data) => api.post(`/matches/${id}/change-bowler`, data),
  addBall: (id, data) => api.post(`/matches/${id}/ball`, data),
  addWicket: (id, data) => api.post(`/matches/${id}/wicket`, data),
  addExtra: (id, type, data) => api.post(`/matches/${id}/${type}`, data), // type can be wide, noball, bye, legbye
  undoBall: (id) => api.post(`/matches/${id}/undo`),
  endInnings: (id) => api.post(`/matches/${id}/end-innings`),
  endMatch: (id, data) => api.post(`/matches/${id}/end-match`, data),
};

export const tournamentService = {
  getTournaments: () => api.get('/tournaments'),
  createTournament: (data) => api.post('/tournaments', data),
};

export default api;
