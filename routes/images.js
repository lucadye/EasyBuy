const express = require('express');
const router = express.Router();
const path = require('node:path/posix');
const { existsSync, rmSync, writeSync, openSync } = require('fs');

const imageParser = express.raw({
  type: 'image/png',
  limit: '10mb'
});

async function validateId({params: {id}, db}, res, next) {
  try {
    id = Number(id);
  } catch (err) {
    return res.status(400).send('Invalid product id');
  }
  if ( typeof id !== 'number'
    || id < 1
    || Math.trunc(id) !== id
  ) res.status(400).send('Invalid product id');
  let {rows, rowCount} = await db.query(`
    SELECT id
    FROM products
    WHERE id = $1;
  `, [id]);
  if (rowCount !== 1) return res.sendStatus(404);
  next()
}

function validateIndex({params: {index}}, res, next) {
  try {
    index = Number(index);
  } catch (err) {
    return res.status(400).send('Invalid image index');
  }
  if ( typeof index !== 'number'
    || index < 1
    || Math.trunc(index) !== index
  ) res.status(400).send('Invalid image index');
  next();
}

router.get('/:id(\\d+)', validateId,
async ({params: {id}, db}, res) => {
  let {rows, rowCount} = await db.query(`
    SELECT image_type AS file_ext,
      image_index AS index
    FROM product_images
    WHERE product_id = $1;
  `, [id]);
  if (rowCount < 1) return res.sendStatus(204);
  const images = [];
  rows.forEach(({file_ext, index}) => {
    const path = `api/images/${id}-${index}.${file_ext}`;
    images.push({
      id,
      index,
      path,
    });
  });
  res.json(images);
});

router.get('/:id(\\d+)-:index(\\d+).:fileExt', validateId, validateIndex,
async ({params: {id, index}, db}, res) => {
  let {rows, rowCount} = await db.query(`
    SELECT image_type AS file_ext
    FROM product_images
    WHERE product_id = $1
      AND image_index = $2;
  `, [id, index]);
  if (rowCount !== 1) return res.sendStatus(404);
  const filePath = path.resolve(`images/${id}-${index}.${rows[0].file_ext}`);
  if (!existsSync(filePath)) return res.sendStatus(404);
  res.sendFile(filePath);
});

router.put('/:id(\\d+)-:index(\\d+).:fileExt', validateId, validateIndex, imageParser,
async ({body}, res, next) => {
  if (!Buffer.isBuffer(body)) res.sendStatus(400);
  next();
},
async ({params: {id, index, fileExt}, body, db}, res, next) => {
  let {rows, rowCount} = await db.query(`
    SELECT *
    FROM product_images
    WHERE product_id = $1
      AND image_index = $2;
  `, [id, index]);
  if (rowCount > 0) return next();
  const fd = openSync(path.resolve(`images/${id}-${index}.${fileExt}`), 'w');
  writeSync(fd, body);
  res.sendStatus(201);
},
async ({params: {id, index, fileExt}, body, db}, res) => {
  let {rows, rowCount} = await db.query(`
    SELECT image_type AS file_ext
    FROM product_images
    WHERE product_id = $1
      AND image_index = $2;
  `, [id, index]);
  if (fileExt !== rows[0].file_ext) {
    rmSync(path.resolve(`images/${id}-${index}.${rows[0].file_ext}`));
  }
  const fd = openSync(path.resolve(`images/${id}-${index}.${fileExt}`), 'w');
  writeSync(fd, body);
  res.sendStatus(204);
})

router.delete('/:id(\\d+)-:index(\\d+).:fileExt', validateId, validateIndex,
async ({params: {id, index, fileExt}, db}, res) => {
  let {rows, rowCount} = await db.query(`
    SELECT image_type AS file_ext
    FROM product_images
    WHERE product_id = $1
      AND image_index = $2;
  `, [id, index]);
  if (rowCount !== 1) return res.sendStatus(404);
  const filePath = path.resolve(`images/${id}-${index}.${rows[0].file_ext}`);
  if (!existsSync(filePath)) return res.sendStatus(404);
  rmSync(filePath);
  await db.query(`
    DELETE FROM product_images
    WHERE product_id = $1
      AND image_index = $2;
  `, [id, index]);
  res.sendStatus(204);
});

module.exports = router;
