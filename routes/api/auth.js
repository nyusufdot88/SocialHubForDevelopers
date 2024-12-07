import express from 'express';
import auth from '../../middleware/auth.js';
import User from '../../models/User.js';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import config from 'config';
import bcrypt from 'bcryptjs';

const authRouter = express.Router();

// @rout get api/auth
// @desc get all users
// @access   Public
authRouter.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
    // console.log(req.user.id);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @rout    Post api/auth
// @desc    authenticate user & get token
// @access   Public

authRouter.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'password is required!').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: [{ msg: 'invalid credentials' }] });
      }

      // make user the password matchs
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ error: [{ msg: 'invalid credentials' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          // console.log('Generated Token:', token);
          res.json({ token });
        }
      );

      // Return a response (this can later return a token)
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

export default authRouter;
