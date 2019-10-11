const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    let token = '';
    if(req.cookies.token) {
      token = req.cookies.token;
    } else {
      token = req.body.token;
    }
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token});

    if(!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch(err) {
    res.status(401).send();
  }
};

module.exports = auth;
