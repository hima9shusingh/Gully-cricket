const Match = require('../models/Match');
const { processBall, undoLastBall, changeBowlerService } = require('../services/scoringService');

exports.getMatches = async (req, res, next) => {
  try {
    const matches = await Match.find()
      .populate('teamA teamB battingFirst tossWinner winner')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    next(error);
  }
};

exports.getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({ path: 'teamA', populate: { path: 'players' } })
      .populate({ path: 'teamB', populate: { path: 'players' } })
      .populate('battingFirst tossWinner winner')
      .populate('currentStriker currentNonStriker currentBowler')
      .populate('ballHistory');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

exports.createMatch = async (req, res, next) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

exports.updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

exports.deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- SCORING ENGINE ENDPOINTS ---

exports.startMatch = async (req, res, next) => {
  try {
    const { striker, nonStriker, currentBowler } = req.body;
    
    if (striker === nonStriker) {
       return res.status(400).json({ message: 'Striker and Non-Striker must be different players' });
    }
    
    let match = await Match.findByIdAndUpdate(req.params.id, {
      status: 'Live',
      currentStriker: striker,
      currentNonStriker: nonStriker,
      currentBowler: currentBowler
    }, { new: true });
    
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    match = await Match.findById(match._id)
      .populate({ path: 'teamA', populate: { path: 'players' } })
      .populate({ path: 'teamB', populate: { path: 'players' } })
      .populate('battingFirst tossWinner winner')
      .populate('currentStriker currentNonStriker currentBowler')
      .populate('ballHistory');
    
    const io = req.app.get('io');
    if (io) io.to(`match_${match._id}`).emit('match_started', match);
    
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

// Generic event handler mapping to specific routes
const handleEvent = (type) => async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const payload = { type, ...req.body };
    const updatedMatch = await processBall(req.params.id, payload, io);
    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    next(error);
  }
};

exports.changeBowler = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const { bowlerId } = req.body;
    const updatedMatch = await changeBowlerService(req.params.id, bowlerId, io);
    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    next(error);
  }
};

exports.addBall = handleEvent('run');
exports.addWicket = handleEvent('wicket');
exports.addWide = handleEvent('wide');
exports.addNoBall = handleEvent('noball');
exports.addBye = handleEvent('bye');
exports.addLegBye = handleEvent('legbye');

exports.undoBall = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const updatedMatch = await undoLastBall(req.params.id, io);
    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    next(error);
  }
};

exports.endInnings = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    match.status = 'Innings Break';
    match.firstInningsScore = match.runs;
    match.firstInningsWickets = match.wickets;
    match.firstInningsOvers = match.overs;
    match.firstInningsBalls = match.balls;
    match.target = match.runs + 1;
    match.currentInnings = 2;
    // Reset state for new innings
    match.runs = 0;
    match.wickets = 0;
    match.overs = 0;
    match.balls = 0;
    match.partnership.runs = 0;
    match.partnership.balls = 0;
    
    // Invalidate the players from the first innings
    match.currentStriker = null;
    match.currentNonStriker = null;
    match.currentBowler = null;
    match.outPlayers = [];
    
    await match.save();
    
    const updatedMatch = await Match.findById(match._id)
      .populate({ path: 'teamA', populate: { path: 'players' } })
      .populate({ path: 'teamB', populate: { path: 'players' } })
      .populate('battingFirst tossWinner winner')
      .populate('currentStriker currentNonStriker currentBowler')
      .populate('ballHistory');

    const io = req.app.get('io');
    if (io) io.to(`match_${match._id}`).emit('innings_completed', updatedMatch);
    
    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error) {
    next(error);
  }
};

exports.endMatch = async (req, res, next) => {
  try {
    const { winner, result } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    match.status = 'Completed';
    if (winner) match.winner = winner;
    if (result) {
      match.result = result;
    } else if (!match.result) {
      if (match.runs === 0 && match.firstInningsScore === 0) {
        match.result = "Match Abandoned";
      } else if (match.currentInnings === 2) {
        if (match.runs >= match.target) {
          match.winner = match.teamA.toString() === match.battingFirst.toString() ? match.teamB : match.teamA;
          match.result = `Chasing Team won by ${10 - match.wickets} wickets`;
        } else if (match.runs === match.target - 1) {
          match.result = "Match Tied";
        } else {
          match.winner = match.battingFirst;
          match.result = `Defending Team won by ${match.target - 1 - match.runs} runs`;
        }
      } else {
        match.result = "Match Ended Early";
      }
    }
    match.completedAt = Date.now();
    await match.save();
    
    const io = req.app.get('io');
    if (io) io.to(`match_${match._id}`).emit('match_completed', match);
    
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};
