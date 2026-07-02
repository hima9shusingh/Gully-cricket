const mongoose = require('mongoose');
const env = require('../backend/src/config/env');
const Match = require('../backend/src/models/Match');
const Team = require('../backend/src/models/Team');
const Player = require('../backend/src/models/Player');
const Ball = require('../backend/src/models/Ball');

const cleanup = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB successfully.');

    const dummyRegex = /^(team \d|abc|xyz|test|asdf|dummy)/i;
    
    console.log('Finding dummy teams...');
    const dummyTeams = await Team.find({ teamName: dummyRegex });
    const teamIds = dummyTeams.map(t => t._id);
    
    if (teamIds.length === 0) {
      console.log('No dummy data found.');
      return;
    }

    console.log('Clearing Matches involving dummy teams...');
    const matchRes = await Match.deleteMany({ $or: [{ teamA: { $in: teamIds } }, { teamB: { $in: teamIds } }] });
    console.log(`Deleted ${matchRes.deletedCount} Matches.`);

    console.log('Clearing Players in dummy teams...');
    const playerRes = await Player.deleteMany({ teamId: { $in: teamIds } });
    console.log(`Deleted ${playerRes.deletedCount} Players.`);

    console.log('Clearing Teams...');
    const teamRes = await Team.deleteMany({ _id: { $in: teamIds } });
    console.log(`Deleted ${teamRes.deletedCount} Teams.`);

    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error cleaning up database:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

cleanup();
