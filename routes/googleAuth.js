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
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/');
  }
);


module.exports = router;
