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
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Encrypting the password (with a pre middleware)

userSchema.pre('save', async function (next) {
  //If the password was not modified (like in an update, we pass the next())
  if (!this.isModified('password')) return next();

  //If the password was modified for an update (this.isNew === false), so we pass the date.
  if (!this.isNew) {
    //we subtract 1second to the time, because sometimes the tokenGenerator is slower then this method,
    //and then the token was expired...
    this.passwordChangedAt = Date.now() - 1000;
  }

  //Call the encryptor in utils (we have to await because other way it resolves a promise)
  this.password = await pwEncryptor.encrypt(this.password);

  //Cleaning the passwordConfirm that was already validated
  this.passwordConfirm = 'Era bom não era?';
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
