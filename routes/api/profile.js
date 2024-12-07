import express from 'express';
import auth from '../../middleware/auth.js';
import Profile from '../../models/Profile.js';
import { check, validationResult } from 'express-validator';

import User from '../../models/User.js';

const profileRouter = express.Router();

// @rout get api/profile/me
// @desc get current users profile
// @access   private
profileRouter.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @rout Post api/profile/
// @desc create and uppdate user profile
// @access   private
profileRouter.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'skills is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;
  }
);

export default profileRouter;
