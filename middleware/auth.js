import jwt from 'jsonwebtoken';
import config from 'config';

export default function (req, res, next) {
  // get the token form the header
  const token = req.header('x-auth-token');
  // check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is invalid' });
  }
}
