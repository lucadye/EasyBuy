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

module.exports = {
  parseBool,
  stringSize,
};
