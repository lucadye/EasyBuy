const express = require('express');
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

function verifyUser(req, res, next) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user.cart_id) return res.status(400).send('Cart is empty');
  next();
}

const statusMap = {
  'pending': null,
  'rejected': false,
  'fulfilled': true,
};

router.post('/start', verifyUser,
async (req, res, next) => {
  const {rows: items, rowCount} = await req.db.query(`
    SELECT
      product_lists.product_id AS id,
      product_lists.product_option AS option,
      product_lists.product_count AS count,
      products.price + product_options.option_price_mod AS price
    FROM product_lists
    INNER JOIN products
      ON products.id = product_lists.product_id
    INNER JOIN product_options
      ON ((product_options.product_id = product_lists.product_id)
      AND (product_options.option_index = product_lists.product_option))
    WHERE list_id = $1;
  `, [req.user.cart_id]);
  if (rowCount < 1) return res.sendStatus(400);
  let total = 0;
  items.forEach(item => total += item.count * item.price);
  req.items = items;
  req.total = total;
  next();
},
async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.total,
    currency: 'usd',
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

router.post('/finish', verifyUser,
async ({db, ...req}, res, next) => {
  console.log('Start')
  await db.query(`
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
  res.redirect(`../users/${req.user.id}/orders`);
  console.log('End')
});

module.exports = router;
