const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teams: [{ type: mongoose.Schema.ObjectId, ref: 'Team' }],
  matches: [{ type: mongoose.Schema.ObjectId, ref: 'Match' }],
  
  pointsTable: [{
    team: { type: mongoose.Schema.ObjectId, ref: 'Team' },
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    nrr: { type: Number, default: 0 } // Net Run Rate
  }],
  
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Ongoing', 'Completed'], 
    default: 'Upcoming' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
