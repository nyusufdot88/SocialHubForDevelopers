import express from 'express';
import auth from '../../middleware/auth.js';
import { check, validationResult } from 'express-validator';
import User from '../../models/User.js';
import Post from '../../models/Post.js';
import Profile from '../../models/Profile.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const postsRouter = express.Router();

// @rout get api/post
// @desc get all posts
// @access   Public
// postsRouter.get('/', (req, res) => res.send('Post Router'));

// @rout POST api/post
// @desc CREATE a posts
// @access   PRIVATE
postsRouter.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @rout get api/posts
// @desc get all posts
// @access   Public

postsRouter.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); // most resten first
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @rout get api/posts/:id
// @desc get post by id
// @access   Public
postsRouter.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      res.status(500).send('Post not found');
    }
    res.status(500).send('Server Error');
  }
});

// @rout delete api/posts/:id
// @desc delete post by id
// @access   Private
postsRouter.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    // check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      res.status(500).send('Post not found');
    }
    res.status(500).send('Server Error');
  }
});

// @rout PUT api/posts/like/:id
// @desc like POST
// @access   Private

postsRouter.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // check if post already liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @rout PUT api/posts/unlike/:id
// @desc unlike POST
// @access   Private
postsRouter.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // check if post already liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post has not been liked' });
    }
    const removeIndex = post.likes.findIndex(
      (like) => like.user.toString() === req.user.id
    );
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @rout POST api/posts/comment/:id
// @desc comment on a POST
// @access   Private

postsRouter.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      post.comments.push(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @rout Delete api/posts/comment/:id/:comment_id
// @desc Delete Comment
// @access   Private

postsRouter.delete(
  '/comment/:id/:comment_id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }

      // check user
      if (comment.user.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ msg: 'Not authorized to delete comment' });
      }

      // get remove index
      const removeIndex = post.comments.findIndex(
        (comments) => comments.user.toString() === req.user.id
      );
      post.comments.splice(removeIndex, 1);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

export default postsRouter;
