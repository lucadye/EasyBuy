const express = require('express');
const router = express.Router();
const {passport} = require('../passport.js');

router.get('/',
  passport.authenticate('google', {
    scope: ['profile']
  })
);

router.get('/callback',
  passport.authenticate('google', {
    failureRedirect: '/failure'
  }),
  (req, res) => {
    res.redirect(`/api/users/${req.user.id}`);
  }
);

router.get('/failure', (req, res) => res.sendStatus(400))

module.exports = router;
