const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamId: { type: mongoose.Schema.ObjectId, ref: 'Team' },
  matches: { type: Number, default: 0 },
  innings: { type: Number, default: 0 },
  
  // Batting stats
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  
  // Bowling stats
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  ballsBowled: { type: Number, default: 0 }, // For precise over calculation
  runsConceded: { type: Number, default: 0 },
  economy: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to calculate derived stats
playerSchema.pre('save', function () {
  // Batting
  if (this.balls > 0) {
    this.strikeRate = (this.runs / this.balls) * 100;
  }
  if (this.innings > 0) {
    // Basic average calculation (runs / innings) - typically it's runs / (innings - notOuts) but we stick to MVP
    this.average = this.runs / this.innings; 
  }

  // Bowling
  if (this.ballsBowled > 0) {
    this.overs = Math.floor(this.ballsBowled / 6) + (this.ballsBowled % 6) / 10;
    const totalOversDec = this.ballsBowled / 6;
    this.economy = this.runsConceded / totalOversDec;
  }
});

module.exports = mongoose.model('Player', playerSchema);
