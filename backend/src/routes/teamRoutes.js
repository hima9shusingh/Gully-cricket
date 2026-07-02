const express = require('express');
const { getTeams, getTeam, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');

const router = express.Router();

router.route('/')
  .get(getTeams)
  .post(createTeam);

router.route('/:id')
  .get(getTeam)
  .put(updateTeam)
  .delete(deleteTeam);

module.exports = router;
