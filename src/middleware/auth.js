const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const refreshToken = req.cookies.refreshToken;

    let user = '';
    let newToken = '';

    await jwt.verify(token, process.env.SECRET,  async (error, decoded) => {
      if(error) {
        if (error.name === 'TokenExpiredError') {
          const dec = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
          user = await User.findOne({_id: dec._id, 'refreshTokens.refreshToken': refreshToken});
          newToken = await user.generateAuthToken();
          if(!user) {
            throw new Error();
          }
        } else {
          throw new Error();
        }
      } else if (decoded) {
        user = await User.findOne({_id: decoded._id, 'tokens.token': token});
        if(!user) {
          throw new Error();
        }
      }
    });

    if(newToken !== '') {
      req.token = newToken;
    } else {
      req.token = token;
    }
    req.refreshToken = refreshToken;
    req.user = user;
    next();
  } catch(err) {
    res.status(401).send(err);
  }
};

module.exports = auth;
