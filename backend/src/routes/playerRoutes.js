const express = require('express');
const { getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer } = require('../controllers/playerController');

const router = express.Router();

router.route('/')
  .get(getPlayers)
  .post(createPlayer);

router.route('/:id')
  .get(getPlayer)
  .put(updatePlayer)
  .delete(deletePlayer);

module.exports = router;
