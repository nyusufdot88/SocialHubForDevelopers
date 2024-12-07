import express from 'express';
import { check, validationResult } from 'express-validator';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import User from '../../models/User.js';

const userRouter = express.Router();

// @rout get api/users  this just test get
// @desc get all users
// @access   Public
// userRouter.get('/', (req, res) => res.send('User Router'));

// export default userRouter;

// @rout    Post api/users
// @desc    Register User
// @access   Public
userRouter.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ error: [{ msg: 'User already exists' }] });
      }

      // Get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      // Create new user
      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt password (hashing with salt)
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to DB
      await user.save();

      // Return jsonwebtoken

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

export default userRouter;
