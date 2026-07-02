import { faker } from '@faker-js/faker';

// Seed faker for consistent data across reloads if desired, but we'll let it be random for now.
// faker.seed(123);

const TEAM_NAMES = ['Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers', 'Delhi Capitals', 'Kolkata Knights', 'Sunrisers', 'Rajasthan Royals', 'Punjab Kings', 'Gujarat Titans', 'Lucknow Giants', 'Gully Blasters', 'Street Strikers', 'Colony Crushers', 'Local Legends', 'Metro Mavericks', 'Urban United', 'City Centurions', 'Town Thunder', 'Village Vikings', 'Regional Royals'];

const ROLES = ['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'];

export const generateTeams = (count = 20) => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `team-${index + 1}`,
    name: TEAM_NAMES[index] || faker.company.name() + ' CC',
    shortName: (TEAM_NAMES[index] || faker.company.name()).split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase(),
    logo: `https://ui-avatars.com/api/?name=${TEAM_NAMES[index] || 'Team'}&background=random`,
    banner: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800&h=300',
    color: faker.color.rgb(),
    description: faker.company.catchPhrase(),
    stats: {
      matches: faker.number.int({ min: 10, max: 50 }),
      wins: faker.number.int({ min: 5, max: 40 }),
      losses: faker.number.int({ min: 0, max: 20 }),
      nrr: faker.number.float({ min: -1.5, max: 2.5, fractionDigits: 3 }),
      trophies: faker.number.int({ min: 0, max: 5 })
    }
  }));
};

export const generatePlayers = (teams, countPerTeam = 15) => {
  const players = [];
  teams.forEach(team => {
    for (let i = 0; i < countPerTeam; i++) {
      players.push({
        id: faker.string.uuid(),
        teamId: team.id,
        teamName: team.name,
        name: faker.person.fullName({ sex: 'male' }),
        avatar: `https://ui-avatars.com/api/?name=${faker.person.firstName()}&background=random`,
        jerseyNumber: faker.number.int({ min: 1, max: 99 }),
        age: faker.number.int({ min: 16, max: 40 }),
        role: faker.helpers.arrayElement(ROLES),
        stats: {
          careerRuns: faker.number.int({ min: 0, max: 5000 }),
          highestScore: faker.number.int({ min: 0, max: 150 }),
          average: faker.number.float({ min: 10, max: 55, fractionDigits: 2 }),
          strikeRate: faker.number.float({ min: 90, max: 180, fractionDigits: 2 }),
          wickets: faker.number.int({ min: 0, max: 200 }),
          economy: faker.number.float({ min: 5, max: 11, fractionDigits: 2 }),
          bestBowling: `${faker.number.int({ min: 1, max: 6 })}/${faker.number.int({ min: 10, max: 50 })}`,
        }
      });
    }
  });
  return players;
};

export const generateGrounds = (count = 10) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    name: faker.location.street() + ' Stadium',
    city: faker.location.city(),
    address: faker.location.streetAddress(),
    boundarySize: faker.number.int({ min: 55, max: 80 }) + 'm',
    pitchType: faker.helpers.arrayElement(['Batting Paradise', 'Spinning Track', 'Green Top', 'Balanced']),
    stats: {
      highestScore: faker.number.int({ min: 180, max: 260 }),
      lowestScore: faker.number.int({ min: 40, max: 120 }),
      averageScore: faker.number.int({ min: 140, max: 180 })
    }
  }));
};

// Initial Mock DB
export const mockDB = {
  teams: generateTeams(20),
  players: [], // Will be hydrated after teams
  grounds: generateGrounds(10),
};
mockDB.players = generatePlayers(mockDB.teams, 15);

// Simulated API calls with delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getTeams: async () => { await delay(); return mockDB.teams; },
  getTeam: async (id) => { await delay(); return mockDB.teams.find(t => t.id === id); },
  getPlayers: async () => { await delay(); return mockDB.players; },
  getPlayersByTeam: async (teamId) => { await delay(); return mockDB.players.filter(p => p.teamId === teamId); },
  getPlayer: async (id) => { await delay(); return mockDB.players.find(p => p.id === id); },
  getGrounds: async () => { await delay(); return mockDB.grounds; },
};
