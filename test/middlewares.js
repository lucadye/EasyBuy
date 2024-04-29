const {
  validateId,
  validateBody,
} = require('../middlewares.js')

describe('Middlewares', () => {
  const result = {calledNext: false};
  const send = message => result.message = message;
  const res = {
    send,
    status: status => {
      result.status = status
      return {send};
    },
  };
  const expectRejection = () => {
    expect(result).to.deep.equal({
      message: 'Malformed request',
      status: 400,
      calledNext: false,
    });
  };
  const reset = () => {
    result.message    = undefined;
    result.status     = undefined;
    result.calledNext = false;
  };
  const next = () => result.calledNext = true;
  describe(`'validateId' middleware`, () => {
    afterEach(() => {
      reset();
    })
    it('Rejects non-number values', () => {
      validateId({params: {id: 'string'}}, res, next);
      expectRejection();
    })
    it('Rejects non-integers', () => {
      validateId({params: {id: 1.5}}, res, next);
      expectRejection();
    })
    it('Rejects numbers less than one', () => {
      validateId({params: {id: -1}}, res, next);;
      expectRejection();
      reset();
      validateId({params: {id: 0}}, res, next);
      expectRejection();
    })
    it('Accepts valid IDs', () => {
      validateId({params: {id: 1 }}, res, next)
      expect(result.calledNext).to.be.true;
      reset();
      validateId({params: {id: 42}}, res, next)
      expect(result.calledNext).to.be.true;
    })
  })
  describe(`'validateBody' middleware`, () => {
    afterEach(() => {
      reset();
    })
    it('Rejects invalid emails', () => {
      validateBody({body: {
        email: '#broken.email!@example.com$',
      }}, res, next);
      expectRejection();
    })
    it('Rejects invalid boolean values for admin', () => {
      validateBody({body: {
        email: 'bob@example.com',
        admin: `I'm not a valid bool!`,
      }}, res, next);
      expectRejection();
    })
    it('Parses valid boolean values for admin', () => {
      const req = {
        body: {
          email: 'charlie@example.com',
          admin: 'true',
        }
      };
      const expected = {
        body: {
          email: 'charlie@example.com',
          admin: true,
        }
      };
      validateBody(req, res, next);
      expect(req).to.deep.equal(expected);
      req.body.admin = 'false';
      expected.body.admin = false;
      validateBody(req, res, next);
      expect(req).to.deep.equal(expected);
    })
    it('Calls next only when all values are valid', () => {
      validateBody({
        body: {
          email: 'charlie@example.com',
          admin: 'true',
        }
      }, res, next)
      expect(result.calledNext).to.be.true;
      reset();
      validateBody({
        body: {
          email: '#broken.email!@example.com$',
          admin: `I'm not a valid bool!`,
        }
      }, res, next)
      expect(result.calledNext).to.be.false;
    })
  })
})
