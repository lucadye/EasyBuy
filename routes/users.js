const express = require('express');
const router = express.Router();

const bcrypt = require('../bcrypt.js');

const {
  validateBody,
  validateId,
} = require('../middlewares.js');

function userPermitted(req, res, next) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.admin) return next();
  if (req.params.id !== `${req.user.id}`) return res.sendStatus(403);
  return next();
}

router.get('/:id', userPermitted, validateId, async ({params, db}, res) => {
  const result = await db.query(`
    SELECT id, name, admin, cart_id
    FROM users
    WHERE id = $1;
  `, [params.id]);

  if (result.rowCount > 0) {
    res.json(result.rows[0]);
  } else {
    res.status(404).send('Unable to find user');
  }
});

router.patch('/:id', userPermitted, validateId, validateBody, async ({params, body, db, ...req}, res) => {
  const result = await db.query(`
    SELECT id, name, admin, hash, cart_id
    FROM users
    WHERE id = $1;
  `, [params.id]);
  if (result.rowCount < 1) {
    res.status(404).send('Unable to find user');
    return;
  }
  user = result.rows[0];

  if (body.name    === undefined) body.name    = user.name;
  if (body.cart_id === undefined) body.cart_id = user.cart_id;
  if (body.password) body.hash = await bcrypt.hash(body.password);
  else body.hash = user.hash;
  console.log(req.user.admin);
  console.log(body.admin);
  console.log(typeof body.admin);
  console.log(user.admin);
  if (req.user.admin) body.admin = typeof body.admin === 'boolean' ? body.admin : user.admin;
  else body.admin = user.admin;
  
  await db.query(`
    UPDATE users
    SET name = $2, admin = $3, hash = $4, cart_id = $5
    WHERE id = $1;
  `, [params.id, body.name, body.admin, body.hash, body.cart_id]);
  res.status(204).send('Edited the user');
});

router.delete('/:id', userPermitted, validateId, async ({params, db}, res) => {
  const result = await db.query(`
    SELECT id, name, admin, cart_id
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
});

router.get('/orders', userPermitted, async ({db, ...req}, res, next) => {
  const {rows, rowCount} = await db.query(`
    SELECT id, datetime, status, list_id
    FROM orders
    WHERE user_id = $1;
  `, [req.params.userId]);
  if (rowCount < 1) return res.sendStatus(204);
  res.json(rows);
});


module.exports = router;
