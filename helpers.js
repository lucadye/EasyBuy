function parseBool(value, defaultValue) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === '') return defaultValue;

  if (value === 1 || value === 0) return !!value;

  if (typeof value === 'string') {
    value = value.toLowerCase();
    if (value === 'true' || value === '1') {
      return true;
    }
    if (value === 'false' || value === '0') {
      return false;
    }
  }
  throw new Error('Invalid bool');
}

function stringSize(str) {
  return Buffer.byteLength(str, 'utf8');
}

function validPassword(pass) {
  if (pass.length < 12) return false;
  let valid = true
  const regexps = [
    /[A-Z]/, /[a-z]/,
    /[0-9]/, /[&*#!%@$.^_-]/
  ];
  regexps.forEach(r => valid = valid && r.test(pass));
  return valid;
}

module.exports = {
  parseBool,
  stringSize,
  validPassword,
};
