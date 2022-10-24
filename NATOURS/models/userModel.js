const mongoose = require('mongoose');
const validator = require('validator');
const pwEncryptor = require('../utils/pwEncryptor');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please insert your name'],
  },
  email: {
    type: String,
    required: [true, 'Please insert your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please insert a valid email'],
  },
  photo: String,
  passwordChangedAt: Date,
  password: {
    type: String,
    required: [true, 'Please insert a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Please repeat your password in the field confirm password',
    ],
    //This olny works on save / create, not in update
    validate: {
      validator: function (elm) {
        return elm === this.password;
      },
      message: 'The passwords does not match',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
});

//Encrypting the password (with a pre middleware)

userSchema.pre('save', async function (next) {
  //If the password was not modified (like in an update, we pass the next())
  if (!this.isModified('password')) return next();

  //Call the encryptor in utils (we have to await because other way it resolves a promise)
  this.password = await pwEncryptor.encrypt(this.password);

  //Cleaning the passwordConfirm that was already validated
  this.passwordConfirm = 'Era bom não era?';
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
