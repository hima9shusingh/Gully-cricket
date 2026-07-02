const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  logo: {
    type: String, // URL to logo
    default: '',
  },
  captain: {
    type: mongoose.Schema.ObjectId,
    ref: 'Player',
  },
  players: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Player',
  }],
  matchesPlayed: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  netRunRate: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
