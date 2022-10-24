const jwt = require('jsonwebtoken');

//in the sign method we pass atributes to be coded (like _id that is generated by mongodb):
exports.tokenGen = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
