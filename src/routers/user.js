const express = require('express');
const cookieParser = require('cookie-parser');
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
    res.send({token: token});
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.cookie('token', token);
    res.send({token: token});
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
    res.status(200).send();
  } catch(err) {
    res.status(500).send(err);
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

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch(err) {
    res.status(400).send();
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const body = Object.keys(req.body);
  const updates = body.filter(value => {
    return value !== 'token';
  });
  const allowedUpdates = ['username', 'email', 'password', 'avatar'];
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
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

module.exports = router;
