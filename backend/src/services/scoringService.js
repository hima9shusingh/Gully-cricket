const Match = require('../models/Match');
const Ball = require('../models/Ball');
const Player = require('../models/Player');

const getOversDecimal = (balls) => {
  const over = Math.floor(balls / 6);
  const remainder = balls % 6;
  return over + (remainder / 10);
};

exports.changeBowlerService = async (matchId, bowlerId, io) => {
  const match = await Match.findById(matchId);
  if (!match || match.status !== 'Live') {
    throw new Error('Match is not currently Live');
  }

  // Validate the bowler is not the same as the current bowler (consecutive overs)
  if (match.currentBowler && match.currentBowler.toString() === bowlerId.toString()) {
    throw new Error('Same bowler cannot bowl consecutive overs');
  }

  const newBowlerDoc = await Player.findById(bowlerId);
  const isTeamABatting = match.battingFirst.toString() === match.teamA.toString() ? match.currentInnings === 1 : match.currentInnings === 2;
  const bowlingTeamId = isTeamABatting ? match.teamB.toString() : match.teamA.toString();
  if (newBowlerDoc.teamId.toString() !== bowlingTeamId) {
    throw new Error('Bowler does not belong to the bowling team');
  }

  match.currentBowler = bowlerId;
  await match.save();

  const updatedMatch = await Match.findById(matchId)
    .populate({ path: 'teamA', populate: { path: 'players' } })
    .populate({ path: 'teamB', populate: { path: 'players' } })
    .populate('battingFirst tossWinner winner')
    .populate('currentStriker currentNonStriker currentBowler')
    .populate('ballHistory');
    
  if (io) {
    io.to(`match_${matchId}`).emit('score_updated', updatedMatch);
    io.to(`match_${matchId}`).emit('new_bowler_selected', updatedMatch);
  }
  return updatedMatch;
};

exports.processBall = async (matchId, eventData, io) => {
  const match = await Match.findById(matchId);
  if (!match || match.status !== 'Live') {
    throw new Error('Match is not currently Live');
  }

  const { type, value, dismissalType, nextBatsmanId, dismissedBatsmanId } = eventData;
  let runsScored = 0;
  let isLegalBall = true;
  let isExtra = false;
  let rotateStrike = false;
  let isWicket = false;

  const currentStriker = match.currentStriker;
  const currentNonStriker = match.currentNonStriker;
  const currentBowler = match.currentBowler;
  
  // We need to fetch the player models to get their current stats for the undo payload
  const strikerDoc = await Player.findById(currentStriker);
  const nonStrikerDoc = await Player.findById(currentNonStriker);
  const bowlerDoc = await Player.findById(currentBowler);

  const isTeamABatting = match.battingFirst.toString() === match.teamA.toString() ? match.currentInnings === 1 : match.currentInnings === 2;
  const battingTeamId = isTeamABatting ? match.teamA.toString() : match.teamB.toString();
  const bowlingTeamId = isTeamABatting ? match.teamB.toString() : match.teamA.toString();

  if (strikerDoc.teamId.toString() !== battingTeamId) {
     throw new Error('Striker does not belong to the batting team');
  }
  if (nonStrikerDoc.teamId.toString() !== battingTeamId) {
     throw new Error('Non-Striker does not belong to the batting team');
  }
  if (bowlerDoc.teamId.toString() !== bowlingTeamId) {
     throw new Error('Bowler does not belong to the bowling team');
  }

  const currentOverNumber = Math.floor(match.balls / 6);
  const currentBallNumber = (match.balls % 6) + 1;

  // Store perfect snapshot before mutation
  const stateBefore = {
    runs: match.runs,
    wickets: match.wickets,
    overs: match.overs,
    balls: match.balls,
    currentStriker: currentStriker,
    currentNonStriker: currentNonStriker,
    currentBowler: currentBowler,
    partnershipRuns: match.partnership?.runs || 0,
    partnershipBalls: match.partnership?.balls || 0,
    outPlayers: [...(match.outPlayers || [])],
    batsmanStats: {
      runs: strikerDoc?.runs || 0,
      balls: strikerDoc?.balls || 0,
      fours: strikerDoc?.fours || 0,
      sixes: strikerDoc?.sixes || 0
    },
    bowlerStats: {
      ballsBowled: bowlerDoc?.ballsBowled || 0,
      runsConceded: bowlerDoc?.runsConceded || 0,
      wickets: bowlerDoc?.wickets || 0
    }
  };

  const ballDoc = new Ball({
    matchId,
    innings: match.currentInnings,
    over: currentOverNumber,
    ball: currentBallNumber,
    batsman: currentStriker,
    bowler: currentBowler,
    stateBefore
  });
  
  let runsOffBat = 0;
  let extrasOffBowler = 0; // Wides/no-balls penalty
  let extrasToTotal = 0;

  if (type === 'run') {
    runsScored = value;
    runsOffBat = value;
    match.runs += runsScored;
    ballDoc.runs = runsScored;
    if (runsScored % 2 !== 0) rotateStrike = true;
  } else if (type === 'wide') {
    isLegalBall = false;
    isExtra = true;
    extrasToTotal = 1 + (value || 0); // 1 for wide + any extra runs
    extrasOffBowler = extrasToTotal; // Bowler is charged for all wide runs
    match.runs += extrasToTotal;
    ballDoc.isWide = true;
    ballDoc.runs = (value || 0);
    if (value && value % 2 !== 0) rotateStrike = true;
  } else if (type === 'noball') {
    isLegalBall = false;
    isExtra = true;
    runsOffBat = (value || 0); // Runs off the bat
    extrasToTotal = 1 + runsOffBat; // 1 for NB + bat runs
    extrasOffBowler = 1; // Bowler is only charged 1 penalty run
    match.runs += extrasToTotal;
    ballDoc.isNoBall = true;
    ballDoc.runs = runsOffBat;
    if (runsOffBat % 2 !== 0) rotateStrike = true;
  } else if (type === 'bye' || type === 'legbye') {
    runsScored = value;
    match.runs += runsScored;
    isExtra = true;
    if (type === 'bye') ballDoc.isBye = true;
    if (type === 'legbye') ballDoc.isLegBye = true;
    if (runsScored % 2 !== 0) rotateStrike = true;
  } else if (type === 'wicket') {
    isWicket = true;
    match.wickets += 1;
    ballDoc.isWicket = true;
    ballDoc.wicketType = dismissalType || 'Bowled';
    // No rotation for wicket (Caught, Bowled etc, new batsman takes strike). 
    // Except Run Out where they might have crossed.
    if (value && value % 2 !== 0) {
      rotateStrike = true; 
      match.runs += value;
      runsOffBat = value;
      ballDoc.runs = value;
    }
  }

  // Handle balls and overs updates for Match
  if (isLegalBall) {
    match.balls += 1;
    match.overs = getOversDecimal(match.balls);
    if (!match.partnership) match.partnership = { runs: 0, balls: 0 };
    match.partnership.balls += 1;
  }
  
  if (!match.partnership) match.partnership = { runs: 0, balls: 0 };
  match.partnership.runs += (runsOffBat + extrasToTotal + (type === 'bye' || type === 'legbye' ? runsScored : 0));

  if (isWicket) {
    match.partnership.runs = 0;
    match.partnership.balls = 0;
  }

  await ballDoc.save();
  match.ballHistory.push(ballDoc._id);

  // Update Stats for Batsman (Striker)
  let incBatsman = { balls: ((isLegalBall || type === 'noball') && type !== 'bye' && type !== 'legbye') ? 1 : 0, runs: runsOffBat };
  const strikerToUpdate = await Player.findById(currentStriker);
  if (strikerToUpdate) {
    strikerToUpdate.balls += incBatsman.balls;
    strikerToUpdate.runs += incBatsman.runs;
    if (runsOffBat === 4) strikerToUpdate.fours += 1;
    if (runsOffBat === 6) strikerToUpdate.sixes += 1;
    await strikerToUpdate.save();
  }

  // Update Stats for Bowler
  let incBowler = { ballsBowled: isLegalBall ? 1 : 0 };
  let bowlerRuns = runsOffBat + extrasOffBowler;
  const bowlerToUpdate = await Player.findById(currentBowler);
  if (bowlerToUpdate) {
    bowlerToUpdate.ballsBowled += incBowler.ballsBowled;
    bowlerToUpdate.runsConceded += bowlerRuns;
    if (isWicket && dismissalType !== 'Run Out') bowlerToUpdate.wickets += 1;
    await bowlerToUpdate.save();
  }

  let newBatsmanSelected = false;
  if (isWicket) {
    let outPlayerId = match.currentStriker;
    if (dismissedBatsmanId && dismissedBatsmanId.toString() === match.currentNonStriker.toString()) {
       outPlayerId = match.currentNonStriker;
    }
    match.outPlayers.push(outPlayerId);
    
    if (nextBatsmanId && match.wickets < 10) {
      if (outPlayerId.toString() === match.currentNonStriker.toString()) {
         match.currentNonStriker = nextBatsmanId;
      } else {
         match.currentStriker = nextBatsmanId;
      }
      newBatsmanSelected = true;
    }
  }

  // Over completion strike rotation
  let isEndOfOver = false;
  if (isLegalBall && match.balls > 0 && match.balls % 6 === 0) {
    rotateStrike = !rotateStrike; // Over completion forces strike rotation (net swap)
    isEndOfOver = true;
  }

  if (rotateStrike) {
    const temp = match.currentStriker;
    match.currentStriker = match.currentNonStriker;
    match.currentNonStriker = temp;
  }

  // Check Innings End conditions
  const maxBalls = match.oversLimit * 6;
  const isAllOut = match.wickets === 10;
  const isOversFinished = match.balls >= maxBalls;
  let inningsComplete = isAllOut || isOversFinished;

  if (match.currentInnings === 2 && match.runs >= match.target) {
    match.status = 'Completed';
    match.result = `Chasing Team won by ${10 - match.wickets} wickets`;
  } else if (match.currentInnings === 2 && inningsComplete) {
    match.status = 'Completed';
    if (match.runs === match.target - 1) match.result = "Match Tied";
    else match.result = `Defending Team won by ${match.target - 1 - match.runs} runs`;
  } else if (inningsComplete && match.currentInnings === 1) {
    match.status = 'Innings Break';
    match.firstInningsScore = match.runs;
    match.firstInningsWickets = match.wickets;
    match.firstInningsOvers = match.overs;
    match.firstInningsBalls = match.balls;
    match.target = match.runs + 1;
    
    // Transition state for Innings 2 immediately
    match.currentInnings = 2;
    match.runs = 0;
    match.wickets = 0;
    match.overs = 0;
    match.balls = 0;
    match.partnership.runs = 0;
    match.partnership.balls = 0;
    match.currentStriker = null;
    match.currentNonStriker = null;
    match.currentBowler = null;
    match.outPlayers = [];
  }

  await match.save();
  const updatedMatch = await Match.findById(matchId)
    .populate({ path: 'teamA', populate: { path: 'players' } })
    .populate({ path: 'teamB', populate: { path: 'players' } })
    .populate('battingFirst tossWinner winner')
    .populate('currentStriker currentNonStriker currentBowler')
    .populate('ballHistory');
  
  if (io) {
    io.to(`match_${matchId}`).emit('score_updated', updatedMatch);
    if (isWicket) io.to(`match_${matchId}`).emit('wicket_fallen', updatedMatch);
    if (newBatsmanSelected) io.to(`match_${matchId}`).emit('new_batsman_selected', updatedMatch);
    if (isEndOfOver) io.to(`match_${matchId}`).emit('over_completed', updatedMatch);
    if (match.status === 'Innings Break') io.to(`match_${matchId}`).emit('innings_completed', updatedMatch);
    if (match.status === 'Completed') io.to(`match_${matchId}`).emit('match_completed', updatedMatch);
  }

  return updatedMatch;
};

exports.undoLastBall = async (matchId, io) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const lastBall = await Ball.findOne({ matchId }).sort({ createdAt: -1 });
  if (!lastBall) throw new Error('No ball to undo');
  
  const sb = lastBall.stateBefore;
  if (!sb) {
     throw new Error('Cannot undo this ball. It does not have perfect undo state saved.');
  }

  // Restore Match State
  match.runs = sb.runs;
  match.wickets = sb.wickets;
  match.overs = sb.overs;
  match.balls = sb.balls;
  match.currentStriker = sb.currentStriker;
  match.currentNonStriker = sb.currentNonStriker;
  match.currentBowler = sb.currentBowler;
  
  if (!match.partnership) match.partnership = {};
  match.partnership.runs = sb.partnershipRuns;
  match.partnership.balls = sb.partnershipBalls;
  match.outPlayers = sb.outPlayers || [];
  match.status = 'Live';

  match.ballHistory = match.ballHistory.filter(id => id.toString() !== lastBall._id.toString());
  
  // Restore Batsman Stats
  const strikerToUpdate = await Player.findById(sb.currentStriker);
  if (strikerToUpdate) {
    strikerToUpdate.runs = sb.batsmanStats.runs;
    strikerToUpdate.balls = sb.batsmanStats.balls;
    strikerToUpdate.fours = sb.batsmanStats.fours;
    strikerToUpdate.sixes = sb.batsmanStats.sixes;
    await strikerToUpdate.save();
  }

  // Restore Bowler Stats
  const bowlerToUpdate = await Player.findById(sb.currentBowler);
  if (bowlerToUpdate) {
    bowlerToUpdate.ballsBowled = sb.bowlerStats.ballsBowled;
    bowlerToUpdate.runsConceded = sb.bowlerStats.runsConceded;
    bowlerToUpdate.wickets = sb.bowlerStats.wickets;
    await bowlerToUpdate.save();
  }

  await Ball.findByIdAndDelete(lastBall._id);
  await match.save();

  const updatedMatch = await Match.findById(matchId)
    .populate({ path: 'teamA', populate: { path: 'players' } })
    .populate({ path: 'teamB', populate: { path: 'players' } })
    .populate('battingFirst tossWinner winner')
    .populate('currentStriker currentNonStriker currentBowler')
    .populate('ballHistory');
  
  if (io) {
    io.to(`match_${matchId}`).emit('score_updated', updatedMatch);
  }

  return updatedMatch;
};
