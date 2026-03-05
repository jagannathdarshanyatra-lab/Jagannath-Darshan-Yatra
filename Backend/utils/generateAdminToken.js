const jwt = require('jsonwebtoken');

const generateAdminToken = (id, role = 'admin') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = generateAdminToken;
