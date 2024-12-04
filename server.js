import express from 'express';
import connectDB from './config/db.js';
import authRouter from './routes/api/auth.js';
import userRouter from './routes/api/users.js';
import profileRouter from './routes/api/profile.js';
import postRouter from './routes/api/posts.js';

const app = express();

// connect Database
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// define Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is Running on port ${PORT}`));
