const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hash(password) {
  const result = await bcrypt.hash(password, saltRounds);
  return result;
}

async function compare(password, hash) {
  const result = await bcrypt.compare(password, hash);
  return result;
}

module.exports = {
  hash,
  compare,
};
