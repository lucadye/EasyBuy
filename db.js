const {Pool} = require('pg');
let pool = undefined;

const {env} = process;

function start() {
  if (pool !== undefined) {
    throw new Error(`Function 'start' called again without calling function 'end'.`);
  }
  pool = new Pool({
    host:     env.PGHOST || 'localhost',
    port:     env.PGPORT || '6283',
    user:     env.PGUSER || 'postgres',
    password: env.PGPASSWORD || 'postgres',
    database: env.PGDATABASE || 'db',
  });
}

async function query(text, values) {
  let result = await pool.query(text, values);
  result = {
    rows: result.rows,
    rowCount: result.rowCount,
  };
  return result;
}

async function connect() {
  const client = await pool.connect();
  return {
    release: () => client.release(),
    query: async (text, values) => {
      let result = await client.query(text, values);
      result = {
        rows: result.rows,
        rowCount: result.rowCount,
      };
      return result;
    },
  };
}

async function end() {
  await pool.end();
  pool = undefined;
}

module.exports = {
  start,
  query,
  connect,
  end,
};
