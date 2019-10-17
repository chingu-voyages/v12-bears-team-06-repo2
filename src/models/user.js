require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var TodoList = require("./todos");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 2,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if(!validator.isAlphanumeric(value)) {
        throw new Error('Username should only contain letters and numbers.');
      }
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if(!validator.isEmail(value)) {
        throw new Error('Email is invalid.');
      }
    }
  },
  password: {
    type: String,
    minlength: 7,
    trim: true,
    required: true,
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  refreshTokens: [{
    refreshToken: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  },
  destination: {
    type: String
  },
  todoList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TodoList"
    }
  ]}, {
  timestamps: true
});

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, process.env.SECRET, {expiresIn: 900000});
  user.tokens = user.tokens.concat({token});
  await user.save();
  return token;
};

userSchema.methods.generateRefreshToken = async function() {
  const user = this;
  const refreshToken = jwt.sign({_id: user._id.toString()}, process.env.REFRESH_SECRET, {expiresIn: '5d'});
  user.refreshTokens = user.refreshTokens.concat({refreshToken});
  await user.save();
  return refreshToken;
};

userSchema.statics.findByCredentials = async(email, password) => {
  const user = await User.findOne({email});
  if(!user) {
    throw new Error('Unable to login.');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    throw new Error('Unable to login.');
  }
  return user;
};

userSchema.pre('save', async function(next) {
  const user = this;
  if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
