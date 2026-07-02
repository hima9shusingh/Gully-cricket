const Tournament = require('../models/Tournament');

exports.getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find().populate('teams matches');
    res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
  } catch (error) {
    next(error);
  }
};

exports.getTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams')
      .populate('matches')
      .populate('pointsTable.team');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    next(error);
  }
};

exports.createTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json({ success: true, data: tournament });
  } catch (error) {
    next(error);
  }
};

exports.updateTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    next(error);
  }
};

exports.deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
