const passport = require('passport');
const bcrypt = require('./bcrypt.js');
const db = require('./db.js');

function use(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  const LocalStrategy = require('passport-local').Strategy;
  passport.use(new LocalStrategy({
      usernameField: 'name',
      passwordField: 'password',
      session: true,
    }, async (name, pass, done) => {
      const {rows, rowCount} = await db.query(`
        SELECT id, name, hash, admin, cart_id
        FROM users
        WHERE name = $1;
      `, [name]);
      if (rowCount !== 1) return done(null, false);

      const match = await bcrypt.compare(pass, rows[0].hash);
      if (!match) return done(null, false);

      return done(null, {
        id:    rows[0].id,
        name:  rows[0].name,
        admin: rows[0].admin,
      });
    }
  ));

  passport.serializeUser(async (user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const {rows, rowCount} = await db.query(`
      SELECT id, name, admin, cart_id
      FROM users
      WHERE id = $1;
    `, [id]);
    if (rowCount !== 1) return done(new Error('User not found'));
    done(null, rows[0]);
  });
}

module.exports = {
  passport,
  use,
};
