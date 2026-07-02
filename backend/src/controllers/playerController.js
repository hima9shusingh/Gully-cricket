const Player = require('../models/Player');
const Team = require('../models/Team');

exports.getPlayers = async (req, res, next) => {
  try {
    const players = await Player.find().populate('teamId', 'teamName');
    res.status(200).json({ success: true, count: players.length, data: players });
  } catch (error) {
    next(error);
  }
};

exports.getPlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id).populate('teamId', 'teamName');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

exports.createPlayer = async (req, res, next) => {
  try {
    let player = await Player.findOneAndUpdate(
      { name: req.body.name, teamId: req.body.teamId },
      { $setOnInsert: req.body },
      { upsert: true, new: true }
    );
    // Add player to team if it was newly inserted (check if createdAt and updatedAt match roughly, or just add it unconditionally using $addToSet)
    if (req.body.teamId) {
      await Team.findByIdAndUpdate(req.body.teamId, { $addToSet: { players: player._id } });
    }
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

exports.updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

exports.deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    if (player.teamId) {
       await Team.findByIdAndUpdate(player.teamId, { $pull: { players: player._id } });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
