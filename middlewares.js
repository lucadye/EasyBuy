const { validateEmail, parseBool } = require('./helpers.js');

function validateBody({body}, res, next) {
  const invalid = () => res.status(400).send('Malformed request');
  if (validateEmail(body.email) === false) return invalid();
  try {
    body.admin = parseBool(body.admin, false);
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
