const mongoose = require('mongoose');

const ballSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.ObjectId, ref: 'Match', required: true, index: true },
  innings: { type: Number, required: true },
  over: { type: Number, required: true }, // e.g. 0, 1, 2
  ball: { type: Number, required: true }, // e.g. 1 to 6
  runs: { type: Number, default: 0 }, // Runs off the bat
  
  isWicket: { type: Boolean, default: false },
  wicketType: { type: String }, // e.g. Bowled, Caught, Run Out
  
  // Extras
  isWide: { type: Boolean, default: false },
  isNoBall: { type: Boolean, default: false },
  isBye: { type: Boolean, default: false },
  isLegBye: { type: Boolean, default: false },
  
  batsman: { type: mongoose.Schema.ObjectId, ref: 'Player', required: true },
  bowler: { type: mongoose.Schema.ObjectId, ref: 'Player', required: true },
  
  stateBefore: { type: Object }, // Stores match & player stats before this ball for perfect undo
  
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Ball', ballSchema);
