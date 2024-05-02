const express = require('express');
const router = express.Router();

function verifyUser(req, res, next) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user.cart_id) return res.status(400).send('Cart is empty');
  next();
}

function verifyCreditCard(req, res, next) {
  // TODO
  next();
}

const statusMap = {
  'pending': null,
  'rejected': false,
  'fulfilled': true,
};

router.post('/', verifyUser, verifyCreditCard,
async ({db, ...req}, res, next) => {
  const {rows, rowCount} = await db.query(`
    INSERT INTO orders
    (user_id, list_id, datetime)
    VALUES ($1, $2, now())
    RETURNING *;
  `, [req.user.id, req.user.cart_id]);
  await db.query(`
    UPDATE users
    SET cart_id = NULL
    WHERE id = $1;
  `, [req.user.id]);
  if (rows[0].status === null ) rows[0].status = 'pending';
  if (rows[0].status === false) rows[0].status = 'rejected';
  if (rows[0].status === true ) rows[0].status = 'fulfilled';
  res.json(rows[0]);
});

module.exports = router;
