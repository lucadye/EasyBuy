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
    it('Rejects invalid names', () => {
      validateBody({body: {
        name: 'A very looooooooooooooooooooooooooooooooooooooooooooooooooooooong name!',
      }}, res, next);
      expectRejection();
      reset();

      validateBody({body: {
        name: '',
      }}, res, next);
      expectRejection();
    })
    it('Rejects invalid boolean values for admin', () => {
      validateBody({body: {
        name: 'bob',
        admin: `I'm not a valid bool!`,
      }}, res, next);
      expectRejection();
    })
    it('Parses valid boolean values for admin', () => {
      const req = {
        body: {
          name: 'charlie',
          admin: 'true',
        }
      };
      const expected = {
        body: {
          name: 'charlie',
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
          name: 'charlie',
          admin: 'true',
        }
      }, res, next)
      expect(result.calledNext).to.be.true;
      reset();
      validateBody({
        body: {
          name: 'A very looooooooooooooooooooooooooooooooooooooooooooooooooooooong name!',
          admin: `I'm not a valid bool!`,
        }
      }, res, next)
      expect(result.calledNext).to.be.false;
    })
  })
})
