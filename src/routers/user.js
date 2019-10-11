const express = require('express');
const cookieParser = require('cookie-parser');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/users', async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  try {
    await user.save();
    const token = await user.generateAuthToken();
    const data = [user, token];
    res.cookie('token', token);
    res.send(token);
  } catch (err) {
    res.status(400);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.cookie('token', token);
    res.send(token);
  } catch(err) {
    res.status(400).send('Incorrect username or password.');
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.clearCookie('token');
    res.status(200);
  } catch(err) {
    res.status(500).send(err);
  }
});

module.exports = router;
