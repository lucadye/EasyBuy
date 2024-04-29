require('dotenv').config();
const db = require('../db.js');

describe(`Database handling functions`, () => {
  after(() => {
    db.end();
  })
  describe(`'start' function`, () => {
    it('Connects to the database', () => {
      expect(db.start).to.not.throw();
    })
    it('Refuses to reconnect to the database without disconnecting', () => {
      expect(db.start).to.throw();
    })
  })
  describe(`'query' function`, () => {
    it('Returns query results', async () => {
      const expected = {
        rows: [ { a: 'Hello, World!' } ],
        rowCount: 1
      };
      const actual = await db.query(`SELECT 'Hello, World!' AS a`);
      expect(actual).to.deep.equal(expected);
    })
    it('Accepts query parameters', async () => {
      const param = 'Hello, EasyBuy!';
      const expected = {
        rows: [ { a: param } ],
        rowCount: 1
      };
      const actual = await db.query(`SELECT $1 AS a`, [param]);
      expect(actual).to.deep.equal(expected);
    })
    it('Works with multiple columns', async () => {
      const param1 = 'Hello,';
      const param2 = 'EasyBuy!';
      const expected = {
        rows: [ { a: param1, b: param2 } ],
        rowCount: 1
      };
      const actual = await db.query(`
        SELECT $1 AS a, $2 AS b`,
        [param1, param2]);
      expect(actual).to.deep.equal(expected);
    })
    it('Works with multiple rows', async () => {
      const param1 = 'Hello,';
      const param2 = 'EasyBuy!';
      const expected = {
        rows: [ { a: param1 }, { a: param2 } ],
        rowCount: 2
      };
      const actual = await db.query(`
        SELECT a
        FROM (
          SELECT $1 AS a
        ) UNION (
          SELECT $2 AS a
        ) ORDER BY a DESC;`,
        [param1, param2]);
      expect(actual).to.deep.equal(expected);
    })
  })
  describe(`'connect' function`, () => {
    let connection;
    it('Creates a new connection to the database', async () => {
      connection = await db.connect();
      expect(connection).to.be.an('object');
      expect(connection.query).to.be.a('function');
    })
    it(`Connection 'release' function`, async () => {
      expect(connection.release).to.be.a('function');
      connection.release();
    })
    describe(`Connection 'query' function`, () => {
      let con;
      before(async () => {
        con = await db.connect();
      })
      after(async () => {
        con.release();
      })
      it('Returns query results', async () => {
        const expected = {
          rows: [ { a: 'Hello, World!' } ],
          rowCount: 1
        };
        const actual = await con.query(`SELECT 'Hello, World!' AS a`);
        expect(actual).to.deep.equal(expected);
      })
      it('Accepts query parameters', async () => {
        const param = 'Hello, EasyBuy!';
        const expected = {
          rows: [ { a: param } ],
          rowCount: 1
        };
        const actual = await con.query(`SELECT $1 AS a`, [param]);
        expect(actual).to.deep.equal(expected);
      })
      it('Works with multiple columns', async () => {
        const param1 = 'Hello,';
        const param2 = 'EasyBuy!';
        const expected = {
          rows: [ { a: param1, b: param2 } ],
          rowCount: 1
        };
        const actual = await con.query(`
          SELECT $1 AS a, $2 AS b`,
          [param1, param2]);
        expect(actual).to.deep.equal(expected);
      })
      it('Works with multiple rows', async () => {
        const param1 = 'Hello,';
        const param2 = 'EasyBuy!';
        const expected = {
          rows: [ { a: param1 }, { a: param2 } ],
          rowCount: 2
        };
        const actual = await con.query(`
          SELECT a
          FROM (
            SELECT $1 AS a
          ) UNION (
            SELECT $2 AS a
          ) ORDER BY a DESC;`,
          [param1, param2]);
        expect(actual).to.deep.equal(expected);
      })
    })
  })
})
