const {
  parseBool,
  stringSize,
} = require('./helpers.js');

function validateBody({body}, res, next) {
  const invalid = () => res.status(400).send('Malformed request');
  const nameLength = body.name ? stringSize(body.name) : 0;
  if (nameLength > 64 || nameLength < 1) return invalid();
  try {
    body.admin = parseBool(body.admin, undefined);
  }
  catch (err) {
    return invalid();
  }
  next();
}

function validateId({params: {id}}, res, next) {
  try {
    id = Number(id);
  } catch (err) {
    return res.status(400).send('Malformed request');
  } finally {
    if (id !== Math.trunc(id) || id < 1) {
      res.status(400).send('Malformed request');
    }
    else next();
  }
}

module.exports = {
  validateBody,
  validateId,
}
