const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: { type: mongoose.Schema.ObjectId, ref: 'Team', required: true },
  teamB: { type: mongoose.Schema.ObjectId, ref: 'Team', required: true },
  tournament: { type: mongoose.Schema.ObjectId, ref: 'Tournament' },
  ground: { type: String, default: 'Local Ground' },
  tossWinner: { type: mongoose.Schema.ObjectId, ref: 'Team' },
  tossDecision: { type: String, enum: ['bat', 'bowl'] },
  battingFirst: { type: mongoose.Schema.ObjectId, ref: 'Team' },
  oversLimit: { type: Number, required: true },
  
  currentInnings: { type: Number, default: 1 },
  
  // Current innings state
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 }, // Represented as 0.0, 0.1, etc.
  balls: { type: Number, default: 0 }, // Total legal balls in current innings
  
  target: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Live', 'Innings Break', 'Completed'], 
    default: 'Upcoming' 
  },
  winner: { type: mongoose.Schema.ObjectId, ref: 'Team' },
  result: { type: String },
  manOfTheMatch: { type: mongoose.Schema.ObjectId, ref: 'Player' },
  
  currentStriker: { type: mongoose.Schema.ObjectId, ref: 'Player' },
  currentNonStriker: { type: mongoose.Schema.ObjectId, ref: 'Player' },
  currentBowler: { type: mongoose.Schema.ObjectId, ref: 'Player' },
  
  partnership: {
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }
  },
  
  outPlayers: [{ type: mongoose.Schema.ObjectId, ref: 'Player' }],
  
  ballHistory: [{ type: mongoose.Schema.ObjectId, ref: 'Ball' }],
  
  // First Innings Store
  firstInningsScore: { type: Number, default: 0 },
  firstInningsWickets: { type: Number, default: 0 },
  firstInningsOvers: { type: Number, default: 0 },
  firstInningsBalls: { type: Number, default: 0 },
  
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
