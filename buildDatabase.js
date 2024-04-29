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
    console.log('\rFinished building database successfully!');
  } else {
    console.log('\rFailed to build database!  ')
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

run(`Created table 'products'`, `
  CREATE TABLE products (
    id serial PRIMARY KEY,
    name varchar(64) NOT NULL,
    description varchar(256),
    price integer
  );`
);

run(`Created table 'product_options'`, `
  CREATE TABLE product_options (
    product_id integer REFERENCES products(id),
    option_index integer,
    option_name varchar(64) NOT NULL,
    option_price_mod integer,
    PRIMARY KEY(product_id, option_index)
  );`
);

run(`Created table 'product_lists'`, `
  CREATE TABLE product_lists (
    list_id integer,
    product_id integer REFERENCES products(id),
    product_option integer,
    product_count integer,
    PRIMARY KEY (list_id, product_id, product_option),
    FOREIGN KEY(product_id, product_option) REFERENCES product_options(product_id, option_index)
  );`
);

run(`Created table 'users'`, `
  CREATE TABLE users (
    id serial PRIMARY KEY,
    email varchar(254) UNIQUE NOT NULL,
    hash varchar(72) NOT NULL,
    admin boolean NOT NULL DEFAUlT false,
    cart_id integer
  );`
);

run(`Created table 'orders'`, `
  CREATE TABLE orders (
    id serial PRIMARY KEY,
    user_id integer REFERENCES users(id) NOT NULL,
    list_id integer NOT NULL,
    datetime timestamp without time zone NOT NULL,
    status boolean
  );`
);
