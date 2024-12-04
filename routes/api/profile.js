import express from 'express';

const profileRouter = express.Router();

// @rout get api/profile
// @desc get all profile
// @access   Public
profileRouter.get('/', (req, res) => res.send('Profile Router'));

export default profileRouter;
