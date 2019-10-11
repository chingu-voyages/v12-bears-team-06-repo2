const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    let token = '';
    if(req.body.token) {
      token = req.body.token;
    } else {
      token = req.cookies.token;
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
    res.status(401).send(err);
  }
};

module.exports = auth;
