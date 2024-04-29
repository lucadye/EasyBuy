const bcrypt = require('../bcrypt.js');

const plaintext = 'password';
const wrongtext = 'passcode';
const crypttext = '$2b$10$d2NJCs.g4Npb33KzF87Vde/I/mdpXDPNYfOTNrXRHdr0lI4YzdgLK';

describe('bcrypt helpers', () => {
  describe(`'hash' function`, () => {
    it('Encrypts plaintext consistently', async () => {
      const actual = await bcrypt.compare(plaintext, crypttext);
      expect(actual).to.be.true;
    })
  })
  describe(`'compare' function`, () => {
    it('Returns true when the passwords match', async () => {
      const actual = await bcrypt.compare(plaintext, crypttext);
      expect(actual).to.be.true;
    })
    it(`Returns false when the passwords don't match`, async () => {
      const actual = await bcrypt.compare(wrongtext, crypttext);
      expect(actual).to.be.false;
    })
  })
})
