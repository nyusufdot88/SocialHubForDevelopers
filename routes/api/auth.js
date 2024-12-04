import express from 'express';

const authRouter = express.Router();

// @rout get api/auth
// @desc get all users
// @access   Public
authRouter.get('/', (req, res) => res.send('Auth Router'));

export default authRouter;
