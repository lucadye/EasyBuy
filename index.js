require('dotenv').config();
const PORT = process.env.EXPRESS_PORT || 3141;
console.log('[dotenv] Imported configs from .env')


const db = require('./db.js');
db.start();
console.log('[pg] Database connection opened');

process.on('exit', code => {
  db.end();
  console.log('[pg] Database connection closed');
});


const express = require('express');
const app = express();
app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());

app.use(require('./session.js'));

require('./passport.js').use(app);

require('./docs.js')(app, '/docs');

app.use('/api', (req, res, next) => {
  req.db = {
    query: db.query,
    connect: db.connect,
  };
  next();
}, require('./api.js'));

app.listen(PORT, () => {
  console.log(`[express] Listening on port ${PORT}...`);
})
