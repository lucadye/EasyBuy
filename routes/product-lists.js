const express = require('express');
const router = express.Router();

const { validateId } = require('../middlewares.js');


const adminOnly = async ({db, ...req}, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.admin) return next();
  if (`${req.user.cart_id}` === req.params.id) return next();
  if (req.params.id) {
    const {rows, rowCount} = await db.query(`
      SELECT id
      FROM orders
      WHERE user_id = $1
        AND list_id = $2;
    `, [req.user.id, req.params.id]);
    if (rowCount > 0) return next();
  }
  return res.sendStatus(403);
};


router.get('/:id', adminOnly, validateId, async ({db, ...req}, res) => {
  const list = {};
  let result = await db.query(`
    SELECT *
    FROM product_lists
    WHERE list_id = $1;
  `, [req.params.id]);
  if (result.rowCount < 1) return res.sendStatus(404);
  list.id = result.rows[0].list_id;
  list.products = [];
  for (const row of result.rows) {
    const item = {
      id: row.product_id,
      option: row.product_option,
      count: row.product_count,
    };
    let r = await db.query(`
      SELECT name, price
      FROM products
      WHERE id = $1;
    `, [item.id]);
    item.name  = r.rows[0].name;
    item.price = r.rows[0].price / 100;
    r = await db.query(`
      SELECT option_name AS name,
        option_price_mod AS price_mod
      FROM product_options
      WHERE product_id = $1
        AND option_index = $2;
    `, [item.id, item.option]);
    item.option = {
      id: item.option,
      name: r.rows[0].name,
      price_mod: r.rows[0].price_mod / 100,
    };
    list.products.push(item);
  };

  res.json(list);
});


router.post('/', adminOnly, async ({db, body, ...req}, res) => {
  if (!body.products) return res.sendStatus(400);
  let result = await db.query(`
    SELECT list_id
    FROM product_lists
    GROUP BY list_id
    ORDER BY list_id DESC;
  `);
  let list_id = 1;
  if (result.rowCount > 0) list_id += result.rows[0].list_id;
  for (const item of body.products) {
    await db.query(`
      INSERT INTO product_lists
      (list_id, product_id, product_option, product_count)
      VALUES ($1, $2, $3, $4);
    `, [list_id, item.id, item.option_index, item.count]);
  }
  res.redirect(list_id.toString());
});


router.patch('/:id', adminOnly, validateId, async ({db, body, ...req}, res) => {
  if (!body.products) return res.sendStatus(400);
  for (const item of body.products) {
    let result = await db.query(`
      SELECT *
      FROM product_lists
      WHERE list_id = $1
        AND product_id = $2
        AND product_option = $3;
    `, [req.params.id, item.id, item.option_index]);
    if (result.rowCount !== 0) {
      if (item.count > 0) {
        await db.query(`
          UPDATE product_lists
          SET product_count = $1
          WHERE list_id = $2
            AND product_id = $3
            AND product_option = $4;
        `, [item.count, req.params.id, item.id, item.option_index]);
      } else {
        await db.query(`
          DELETE FROM product_lists
          WHERE list_id = $1
            AND product_id = $2
            AND product_option = $3;
        `, [req.params.id, item.id, item.option_index]);
      }
    } else {
      await db.query(`
        INSERT INTO product_lists
        (list_id, product_id, product_option, product_count)
        VALUES ($1, $2, $3, $4);
      `, [req.params.id, item.id, item.option_index, item.count]);
    }
  }
  res.send(
    await db.query(`
      SELECT *
      FROM product_lists
      WHERE list_id = $1;
    `, [Number(req.params.id)])
  );
});


router.delete('/:id', adminOnly, validateId, async ({db, ...req}, res) => {
  let result = await db.query(`
    SELECT *
    FROM product_lists
    WHERE list_id = $1;
  `, [req.params.id]);
  if (result.rowCount < 1) return res.sendStatus(404);
  await db.query(`
    DELETE FROM product_lists
    WHERE list_id = $1;
  `, [req.params.id]);
  res.sendStatus(204);
});


module.exports = router;
