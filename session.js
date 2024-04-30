const session = require('express-session');
const MemoryStore = require('memorystore')(session)

module.exports = session({
  cookie: { maxAge: 86400000 },
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
});
