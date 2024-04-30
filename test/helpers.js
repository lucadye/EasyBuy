const {
  parseBool,
  stringSize,
  validPassword,
} = require('../helpers.js');

const undef = undefined;

describe('Helper functions', () => {
  describe(`'parseBool' function`, () => {
    it(`Returns true if value is true, 1, or 'true'`, () => {
      expect(parseBool(true,   undef)).to.be.true;
      expect(parseBool(1,      undef)).to.be.true;
      expect(parseBool('true', undef)).to.be.true;
    })
    it(`Returns false if value is false, 0, or 'false'`, () => {
      expect(parseBool(false,   undef)).to.be.false;
      expect(parseBool(0,       undef)).to.be.false;
      expect(parseBool('false', undef)).to.be.false;
    })
    it('Is case insensitive', () => {
      expect(parseBool('FaLsE', undef)).to.be.false;
      expect(parseBool('TrUe',  undef)).to.be.true;
    })
    it(`Returns defaultValue if value is undefined or ''`, () => {
      expect(parseBool(undef, undef)).to.be.undefined;
      expect(parseBool('',    undef)).to.be.undefined;
    })
    it(`Throws if value isn't one of the above values`, () => {
      expect(() => parseBool(null,   undef)).to.throw('Invalid bool');
      expect(() => parseBool('life', undef)).to.throw('Invalid bool');
      expect(() => parseBool('42',   undef)).to.throw('Invalid bool');
    })
  })
  describe(`'stringSize' function`, () => {
    it('Returns n for an n byte string', () => {
      expect(stringSize('')).to.deep.equal(0);
      expect(stringSize('3')).to.deep.equal(1);
      expect(stringSize('3.1415')).to.deep.equal(6);
      expect(stringSize('3.14159265358979323846264338327950288419716939937510582097494459')).to.deep.equal(64);
    })
  })
  describe(`'validPassword' function`, () => {
    it('Rejects passwords with less than 12 characters', () => {
      expect(validPassword('Uh!a$6#e')).to.be.false;
      expect(validPassword('y5wMX9#2jKgh')).to.be.true;
    })
    it('Requires at least 1 lowercase letter', () => {
      expect(validPassword('Y5WMX9#2JKGH')).to.be.false;
      expect(validPassword('y5wMX9#2jKgh')).to.be.true;
    })
    it('Requires at least 1 uppercase letter', () => {
      expect(validPassword('y5wmx9#2jkgh')).to.be.false;
      expect(validPassword('y5wMX9#2jKgh')).to.be.true;
    })
    it('Requires at least 1 number', () => {
      expect(validPassword('yFwMXN#TjKgh')).to.be.false;
      expect(validPassword('y5wMX9#2jKgh')).to.be.true;
    })
    it('Requires at least 1 symbol', () => {
      expect(validPassword('y5wMX9H2jKgh')).to.be.false;
      expect(validPassword('y5wMX9#2jKgh')).to.be.true;
    })
  })
})
