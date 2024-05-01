require('dotenv').config();
const {env, stdout} = process;

stdout.write('Building database...');

const pg = require('pg');

const db = new pg.Client({
  host:     env.PGHOST,
  port:     env.PGPORT,
  user:     env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
});

stdout.write('\rConnecting to database...');
db.connect();
stdout.write('\rConnected to database.   ');

process.on('exit', code => {
  stdout.write('\rClosing database connection...')
  db.end();
  stdout.write('\rClosed database connection.   ');
  if (code === 0) {
    console.log('\rFinished clearing database successfully!');
  } else {
    console.log('\rFailed to clear database!  ')
  }
});

let commandCount = 0;
let status = 0;

function run(text, query) {
  commandCount++;
  db.query(query).then(
  result => {
    stdout.write(`\r${text}`);
  },
  error => {
    stdout.write(`\r${error}\n`);
    status = 1;
  })
  .finally(() => {
    console.groupEnd();
    commandCount--;
    if (commandCount < 1) {
      process.exit(status);
    }
  });
}

run(`Dropped table 'orders'`, `DROP TABLE IF EXISTS orders;`);
run(`Dropped table 'users'`, `DROP TABLE IF EXISTS users;`);
run(`Dropped table 'product_lists'`, `DROP TABLE IF EXISTS product_lists;`);
run(`Dropped table 'product_imagess'`, `DROP TABLE IF EXISTS product_images;`);
run(`Dropped table 'product_options'`, `DROP TABLE IF EXISTS product_options;`);
run(`Dropped table 'products'`, `DROP TABLE IF EXISTS products;`);
