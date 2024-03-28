const {Pool} = require('pg');
let pool;

const {env} = process;

function start() {
  pool = new Pool({
    host:     env.PGHOST,
    port:     env.PGPORT,
    user:     env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
  });
}

async function query(text, values) {
  let result = pool.query(text, values);
  result = {
    rows: results.rows,
    rowCount: results.rowCount,
  };
  return result;
}

async function end() {
  await pool.end();
}

module.exports = {
  start,
  query,
  end,
};
