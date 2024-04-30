const express = require('express');
const router = express.Router();

const {passport} = require('../passport.js');
const bcrypt = require('../bcrypt.js');

const { validPassword } = require('../helpers.js');
const { validateBody } = require('../middlewares.js');


router.post('/sign-up', validateBody, (req, res, next) => {
  if (!req.body.admin) return next();
  const unauthorized = () => {
    res.status(403).send('Only admins can create admin accounts');
  };
  if (!req.isAuthenticated()) return unauthorized();
  if (!req.user.admin) return unauthorized();
  return next();

}, async ({db, body}, res, next) => {
  if (!validPassword(body.password)) {
    return res.status(400).send('Invalid password');
  }
  const hash = await bcrypt.hash(body.password);
  db.query(`
    INSERT INTO users (name, hash, admin)
    VALUES ($1, $2, $3);
  `, [body.name, hash, body.admin])
  .then(
  () => {
    return next();
  },
  error => {
    if (error.message.includes('users_name_key')) {
      res.status(400).send('Name already in use');
    }
    else {
      throw error;
    }
  });
}, passport.authenticate('local'),
  (req, res) => {
    res.redirect(`/api/users/${req.user.id}`);
  }
);


router.post('/sign-in', passport.authenticate('local'),
  (req, res) => {
    res.redirect(`/api/users/${req.user.id}`);
  }
);


router.post('/sign-out', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});


module.exports = router;
