const {
  parseBool,
  validateEmail,
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
  describe(`'validateEmail' function`, () => {
    it('Returns true if the email is valid', () => {
      expect(validateEmail('alice@example.com')).to.be.true;
    })
    it(`Returns undefined if email is ''`, () => {
      expect(validateEmail('')).to.be.undefined;
    })
    it(`Returns false if it doesn't have exactly one '@' sign`, () => {
      expect(validateEmail('alice.example.com')).to.be.false;
      expect(validateEmail('alice@mail@example.com')).to.be.false;
    })
    it(`Returns false if it has no local part`, () => {
      expect(validateEmail('@example.com')).to.be.false;
    })
    it('Returns false the local part includes invalid characters', () => {
      expect(validateEmail('a"b (c)d,e:f;gi [jk]l@example.com')).to.be.false;
    })
    describe(`Returns false if it has an invalid domain`, () => {
      it('Returns false if it has no domain', () => {
        expect(validateEmail('alice@')).to.be.false;
        expect(validateEmail('alice@.')).to.be.false;
      })
      it('Returns false if it includes invalid characters', () => {
        expect(validateEmail('alice@!nv&l!d.#com!')).to.be.false;
      })
      it('Returns false if it has no top-level domain', () => {
        expect(validateEmail('alice@.com')).to.be.false;
      })
      it('Returns false if it has no second-level domain', () => {
        expect(validateEmail('alice@example.')).to.be.false;
      })
      it(`Accepts third-level (or higher) domains`, () => {
        expect(validateEmail('alice@mail.example.com')).to.be.true;
      })
    })
  })
})
