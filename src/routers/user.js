const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2500000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a photo.'));
    }
    cb(undefined, true);
  }
});

router.post('/users/register', async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  try {
    await user.save();
    const token = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();
    const data = token;
    res.cookie('refreshToken', refreshToken, {httpOnly: true});
    res.send({username: req.body.username, token: token});
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await User.findByCredentials(email, req.body.password);
    const token = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();
    res.cookie('refreshToken', refreshToken,  {httpOnly: true});
    res.send({username: user.username, token: token});
  } catch(err) {
    console.log(err);
    res.status(400).send('Incorrect username or password.');
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    req.user.refreshTokens = req.user.refreshTokens.filter((refreshToken) => {
      return refreshToken.refreshToken !== req.refreshToken;
    });
    await req.user.save();
    res.clearCookie('refreshToken');
    res.status(200).send();
  } catch(err) {
    res.status(500).send(err);
    console.log(err);
  }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
  }, (err, req, res, next) => {
  res.status(400).send(err);
});

router.get('/users/me/avatar', auth, async (req, res) => {
  try {
    if(!req.user.avatar) {
      return res.send();
    }
    const img = req.user.avatar.toString('base64');
    res.send(img);
  } catch(err) {
    res.status(400).send();
  }
});

router.get('/users/me/destination', auth, async (req, res) => {
  try {
    if(!req.user.destination) {
      return res.send();
    }
    res.send({destination: req.user.destination});
  } catch(err) {
    res.status(400).send();
  }
});

router.post('/users/me/date', auth, async (req, res) => {
  try {
    req.user.date = req.body.date;
    await req.user.save();
    res.status(200).send({date: req.user.date});
  } catch(err) {
    res.status(400).send();
  }
});

router.get('/users/me/date', auth, async (req, res) => {
  try {
    if(!req.user.date) {
      return res.send();
    }
    res.send({date: req.user.date});
  } catch(err) {
    res.status(400).send();
  }
});

router.delete('/users/me/destination', auth, async (req, res) => {
  try {
    req.user.destination = undefined;
    req.user.date = undefined;
    await req.user.save();
    res.send();
  } catch(err) {
    res.status(400).send();
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const body = Object.keys(req.body);
  const updates = body.filter(value => {
    return value !== 'token';
  });
  const allowedUpdates = ['username', 'email', 'password', 'avatar', 'destination'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if(!isValidOperation) {
    return res.status(400).send('Invalid updates!');
  }
  try {
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/users/me/avatar', auth, async (req,res) => {
  try{
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/auth', auth, (req, res) => {
  res.status(200).send({user: req.user.username});
});

module.exports = router;
