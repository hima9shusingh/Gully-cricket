const Player = require('../models/Player');
const Team = require('../models/Team');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Public
exports.getDashboardStats = async (req, res, next) => {
  try {
    const topRunScorers = await Player.find().sort({ 'stats.runs': -1 }).limit(5).populate('team', 'name');
    const topWicketTakers = await Player.find().sort({ 'stats.wickets': -1 }).limit(5).populate('team', 'name');
    const topTeams = await Team.find().sort({ 'stats.wins': -1, 'stats.nrr': -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        topRunScorers,
        topWicketTakers,
        topTeams
      }
    });
  } catch (error) {
    next(error);
  }
};
