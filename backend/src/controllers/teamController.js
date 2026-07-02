const Team = require('../models/Team');

exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().populate('captain players');
    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    next(error);
  }
};

exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('captain players');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

exports.createTeam = async (req, res, next) => {
  try {
    const team = await Team.findOneAndUpdate(
      { teamName: req.body.teamName },
      { $setOnInsert: req.body },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
