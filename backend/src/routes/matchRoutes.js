const express = require('express');
const {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  changeBowler,
  addBall,
  addWicket,
  addWide,
  addNoBall,
  addBye,
  addLegBye,
  undoBall,
  endInnings,
  endMatch
} = require('../controllers/matchController');

const router = express.Router();

router.route('/')
  .get(getMatches)
  .post(createMatch);

router.route('/:id')
  .get(getMatch)
  .put(updateMatch)
  .delete(deleteMatch);

// Scoring Engine Routes
router.post('/:id/start', startMatch);
router.post('/:id/change-bowler', changeBowler);
router.post('/:id/ball', addBall);
router.post('/:id/wicket', addWicket);
router.post('/:id/wide', addWide);
router.post('/:id/noball', addNoBall);
router.post('/:id/bye', addBye);
router.post('/:id/legbye', addLegBye);
router.post('/:id/undo', undoBall);
router.post('/:id/end-innings', endInnings);
router.post('/:id/end-match', endMatch);

module.exports = router;
