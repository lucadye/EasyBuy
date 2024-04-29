const express = require('express');
const router = express.Router();

const bcrypt = require('../bcrypt.js');

const asyncHandler = require('express-async-handler');
const {
  validateBody,
  validateId,
} = require('../middlewares.js');

router.get('/:id', validateId, asyncHandler(async ({params, db}, res) => {
  const result = await db.query(`
    SELECT id, email, admin, cart_id
    FROM users
    WHERE id = $1;
  `, [params.id]);

  if (result.rowCount > 0) {
    res.json(result.rows[0]);
  } else {
    res.status(404).send('Unable to find user');
  }
}));

router.post('/', validateBody, asyncHandler(async ({body, db}, res) => {
  db = await db.connect();

  let result = await db.query(`
    SELECT id, email, admin, cart_id
    FROM users
    WHERE email = $1;
  `, [body.email]);

  if (result.rowCount > 0) {
    res.status(409).send('Email already in use');
    db.release();
    return;
  }

  const hash = await bcrypt.hash(body.password);
  await db.query(`
    INSERT INTO users
    (email, hash, admin)
    values ($1, $2, $3);
  `, [body.email, hash, body.admin]);

  result = await db.query(`
    SELECT id, email, admin, cart_id
    FROM users
    WHERE email = $1;
  `, [body.email]);

  db.release();
  res.status(201).json(result.rows[0]);
}));

router.patch('/:id', validateId, validateBody, asyncHandler(async ({params, body, db}, res) => {
  const result = await db.query(`
    SELECT id, email, admin, hash
    FROM users
    WHERE id = $1;
  `, [params.id]);
  if (result.rowCount < 1) {
    res.status(404).send('Unable to find user');
    return;
  }
  user = result.rows[0];

  if (body.email === undefined) body.email = user.email;
  if (body.admin === undefined) body.admin = user.admin;
  if (body.password) body.hash = await bcrypt.hash(body.password);
  else body.hash = user.hash;

  await db.query(`
    UPDATE users
    SET email = $2, admin = $3, hash = $4
    WHERE id = $1;
  `, [params.id, body.email, body.admin, body.hash]);
  res.status(204).send('Edited the user');
}));

router.delete('/:id', validateId, asyncHandler(async ({params, db}, res) => {
  const result = await db.query(`
    SELECT id, email, admin, cart_id
    FROM users
    WHERE id = $1;
  `, [params.id]);

  if (result.rowCount < 1) {
    res.status(404).send('Unable to find user');
    return;
  }

  await db.query(`
    DELETE FROM users
    WHERE id = $1;
  `, [params.id]);
  res.status(204).send('Deleted the user');
}));

module.exports = router;
