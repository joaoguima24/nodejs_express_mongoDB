const bcrypt = require('bcryptjs');

//Encrypt the password with 12 hash
exports.encrypt = (pass) => bcrypt.hash(pass, 12);

//Compare passwords
//bcrypt.compare returns true or false.
exports.comparePassword = (candidatePassword, userPassword) =>
  bcrypt.compare(candidatePassword, userPassword);
