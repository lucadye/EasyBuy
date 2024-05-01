const express = require('express');
const router = express.Router();

const { validateId } = require('../middlewares.js');


const adminOnly = (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user.admin) return res.sendStatus(403);
  return next();
};

const mustExist = async ({db, params}, res, next) => {
  let {rows, rowCount} = await db.query(`
    SELECT *
    FROM products
    WHERE id = $1;
  `, [params.id]);
  if (rowCount !== 1) return res.sendStatus(404);
  else return next();
};


router.get('/', async ({db}, res, next) => {
  let {rows, rowCount} = await db.query(`
    SELECT *
    FROM products;
  `);
  rows.forEach(row => row.price /= 100);
  res.json(rows);
});


router.get('/:id', async ({db, params}, res, next) => {
  let {rows, rowCount} = await db.query(`
    SELECT *
    FROM products
    WHERE id = $1;
  `, [params.id]);
  if (rowCount !== 1) return res.sendStatus(404);
  rows[0].price /= 100;
  res.json(rows[0]);
});


router.patch('/:id', adminOnly, mustExist,
  async ({db, params, body}, res, next) => {
  body.price *= 100;
  let {rows, rowCount} = await db.query(`
    SELECT *
    FROM products
    WHERE id = $1;
  `, [params.id]);
  if (rowCount !== 1) return res.sendStatus(404);

  const name        = body.name        || rows[0].name;
  const description = body.description || rows[0].description;
  const price       = body.price       || rows[0].price;

  await db.query(`
    UPDATE products
    SET name = $1, description = $2, price = $3
    WHERE id = $4;
  `, [name, description, price, params.id]);

  res.status(204).json({
    id: params.id,
    name,
    description,
    price: price / 100,
  });
});


router.post('/', adminOnly,
  async ({db, body}, res, next) => {
  await db.query(`
    INSERT INTO products
    (name, description, price)
    VALUES ($1, $2, $3);
  `, [body.name, body.description, body.price * 100]);
  const {rows, rowCount} = await db.query(`
    SELECT *
    FROM products
    WHERE name = $1;
  `, [body.name]);
  rows[0].price /= 100;
  res.status(201).json(rows[0]);
});


router.delete('/:id', adminOnly, mustExist,
  async ({db, params}, res, next) => {
  await db.query(`
    DELETE FROM products
    WHERE id = $1;
  `, [params.id]);
  let {rows, rowCount} = await db.query(`
    SELECT *
    FROM products
    WHERE id = $1;
  `, [params.id]);
  rows[0].price /= 100
  res.status(204).json(rows[0]);
});


const optionsRouter = express.Router();
optionsRouter.use((req, res, next) => {
  req.product_id;
  next();
});


optionsRouter.get('/', async ({db, product_id}, res, next) => {
  let {rows, rowCount} = await db.query(`
    SELECT option_name AS name,
      option_price_mod AS price_mod
    FROM product_options
    WHERE product_id = $1
    ORDER BY option_index ASC;
  `, [product_id]);
  rows.forEach(row => row.price_mod /= 100);
  res.json(rows);
});


optionsRouter.get('/:index', async ({db, product_id, params}, res, next) => {
  let {rows, rowCount} = await db.query(`
    SELECT option_name AS name,
      option_price_mod AS price_mod
    FROM product_options
    WHERE product_id = $1
      AND option_index = $2;
  `, [product_id, params.index]);
  if (rowCount !== 1) return res.sendStatus(404);
  rows[0].price_mod /= 100;
  res.json(rows[0]);
});


optionsRouter.patch('/:index', async ({db, product_id, params, body}, res, next) => {
  if (body.price_mod) body.price_mod *= 100;
  let {rows, rowCount} = await db.query(`
    SELECT option_name AS name,
      option_price_mod AS price_mod
    FROM product_options
    WHERE product_id = $1
      AND option_index = $2;
  `, [product_id, params.index]);
  if (rowCount !== 1) return res.sendStatus(404);
  const name      = body.name      || rows[0].name;
  const price_mod = body.price_mod || rows[0].price_mod;
  await db.query(`
    UPDATE product_options
    SET option_name = $1,
      option_price_mod = $2
    WHERE product_id = $3
      AND option_index = $4
  `, [name, price_mod, product_id, params.index]);
  res.redirect(`/api/products/${product_id}/options/${params.index}`);
});


optionsRouter.post('/', async ({db, product_id, body}, res, next) => {
  if (body.price_mod) body.price_mod *= 100;
  let {rows, rowCount} = await db.query(`
    SELECT option_index AS index
    FROM product_options
    WHERE product_id = $1
    ORDER BY option_index DESC;
  `, [product_id]);
  let index = 1;
  if (rowCount > 0) index += rows[0].index;
  await db.query(`
    INSERT INTO product_options
    (product_id, option_index, option_name, option_price_mod)
    VALUES ($1, $2, $3, $4);
  `, [product_id, index, body.name, body.price_mod]);
  res.redirect(`/api/products/${product_id}/options/${index}`);
});


optionsRouter.delete('/:index', async ({db, product_id, params}, res, next) => {
  let {rows, rowCount} = await db.query(`
    SELECT option_name AS name,
      option_price_mod AS price_mod
    FROM product_options
    WHERE product_id = $1
      AND option_index = $2;
  `, [product_id, params.index]);
  if (rowCount !== 1) return res.sendStatus(404);
  await db.query(`
    DELETE FROM product_options
    WHERE product_id = $1
      AND option_index = $2
  `, [product_id, params.index]);
  await db.query(`
    UPDATE product_options
    SET option_index = option_index - 1
    WHERE product_id = $1
      AND option_index > $2
  `, [product_id, params.index]);
  res.sendStatus(204);
});


router.use('/:id/options', mustExist, (req, res, next) => {
  req.product_id = req.params.id;
  next();
}, optionsRouter);


module.exports = router;
