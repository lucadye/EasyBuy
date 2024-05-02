const express = require('express');
const router = express.Router();

const { validateId } = require('../middlewares.js');

const adminOnly = (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.admin) return next();
  return res.sendStatus(403);
};

const userPermitted = async ({db, ...req}, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.admin) return next();
  const {rows, rowCount} = await db.query(`
    SELECT user_id
    FROM orders
    WHERE id = $1;
  `, [req.params.id]);
  if (rowCount < 1) return res.sendStatus(404);
  if (req.user.id === rows[0].user_id) return next();
  return res.sendStatus(403);
};

const statusMap = {
  'pending': null,
  'rejected': false,
  'fulfilled': true,
};

router.get('/', adminOnly, ({query: q}, res, next) => {
  if (typeof q.status !== 'string') return res.sendStatus(400);
  q.status = q.status.toLowerCase();
  if (!Object.keys(statusMap).includes(q.status)) {
    return res.sendStatus(400);
  }
  q.status = statusMap[q.status];
  if (q.sortOrder === undefined) q.sortOrder = 'ASC';
  if (typeof q.sortOrder !== 'string') return res.sendStatus(400);
  q.sortOrder = q.sortOrder.toUpperCase();
  if (!['ASC', 'DESC',
    undefined].includes(q.sortOrder)) {
    return res.sendStatus(400);
  }
  if (q.sortBy === undefined) q.sortBy = 'datetime';
  if (typeof q.sortBy !== 'string') return res.sendStatus(400);
  q.sortBy = q.sortBy.toLowerCase();
  if (!['user', 'datetime',
    undefined].includes(q.sortBy)) {
    return res.sendStatus(400);
  }
  if (q.sortBy === 'user') q.sortBy = 'user_id';
  next();
},
async ({db, query: q}, res, next) => {
  let query = `
      SELECT id, datetime,
        status, list_id, user_id
      FROM orders`;
  let args = [q.sortBy];
  if (q.status === null) {
    query += `
      WHERE status IS NULL`;
  } else {
    query += `
      WHERE status = $2`;
    args.push(q.status);
  }
  if (q.sortOrder === 'ASC') {
    query += `
      ORDER BY $1 ASC;`;
  }
  else {
    query += `
      ORDER BY $1 DESC;`;
  }
  const {rows, rowCount} = await db.query(query, args);
  if (rowCount < 1) res.sendStatus(204);
  else res.json(rows);
});

router.patch('/:id', userPermitted, validateId, async ({db, ...req}, res, next) => {
  if (typeof req.body.status !== 'string') return res.sendStatus(400);
  req.body.status = req.body.status.toLowerCase();
  if (!Object.keys(statusMap).includes(req.body.status)) {
    return res.sendStatus(400);
  }
  req.body.status = statusMap[req.body.status];
  await db.query(`
    UPDATE orders
    SET status = $1
    WHERE id = $2;
  `, [req.body.status, req.params.id]);
  res.sendStatus(204);
});

module.exports = router;
