import express from 'express';

const postsRouter = express.Router();

// @rout get api/post
// @desc get all posts
// @access   Public
postsRouter.get('/', (req, res) => res.send('Post Router'));

export default postsRouter;
