require('dotenv').config();
const PORT = (process.env.EXPRESS_PORT);
console.log('[dotenv] Imported configs from .env')

const express = require('express');

const app = express();

require('./docs.js')(app, '/docs');

app.listen(PORT, () => {
  console.log(`[express] Listening on port ${PORT}...`);
})
