const mongoose = require('mongoose');
const env = require('../backend/src/config/env');
const Match = require('../backend/src/models/Match');
const Team = require('../backend/src/models/Team');
const Player = require('../backend/src/models/Player');
const scoringService = require('../backend/src/services/scoringService');

const runTest = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    // Create Teams
    const teamA = await Team.create({ teamName: 'Team A Test' });
    const teamB = await Team.create({ teamName: 'Team B Test' });

    // Create Players
    const p1 = await Player.create({ name: 'Babar Test', teamId: teamA._id });
    const p2 = await Player.create({ name: 'Rizwan Test', teamId: teamA._id });
    const p3 = await Player.create({ name: 'Bowler Test', teamId: teamB._id });

    // Create Match
    const match = await Match.create({
      teamA: teamA._id,
      teamB: teamB._id,
      oversLimit: 2,
      battingFirst: teamA._id,
      tossWinner: teamA._id,
      currentStriker: p1._id,
      currentNonStriker: p2._id,
      currentBowler: p3._id,
      status: 'Live'
    });

    console.log(`Initial Babar balls: ${p1.balls}, Rizwan balls: ${p2.balls}`);

    // Ball 1: 1 run (legal)
    await scoringService.processBall(match._id, 'run', { value: 1 }, null);
    
    let updatedP1 = await Player.findById(p1._id);
    let updatedP2 = await Player.findById(p2._id);
    console.log(`After Ball 1 (1 run): Babar balls: ${updatedP1.balls}, Rizwan balls: ${updatedP2.balls}`);

    // Ball 2: Wide
    await scoringService.processBall(match._id, 'wide', { value: 0 }, null);
    
    updatedP1 = await Player.findById(p1._id);
    updatedP2 = await Player.findById(p2._id);
    console.log(`After Ball 2 (Wide): Babar balls: ${updatedP1.balls}, Rizwan balls: ${updatedP2.balls}`);

    // Ball 3: No Ball
    await scoringService.processBall(match._id, 'noball', { value: 0 }, null);
    
    updatedP1 = await Player.findById(p1._id);
    updatedP2 = await Player.findById(p2._id);
    console.log(`After Ball 3 (No Ball): Babar balls: ${updatedP1.balls}, Rizwan balls: ${updatedP2.balls}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTest();
