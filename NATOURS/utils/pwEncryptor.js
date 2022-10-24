const bcrypt = require('bcryptjs');

exports.encrypt = (pass) => bcrypt.hash(pass, 12);
