import express from 'express';
import User from '../models/User.mjs';
import bcrypt from 'bcrypt';
import { isAuthenticated } from './middleware/authMiddleware.mjs';
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, companyName, email, password } = req.body;
    // User model will automatically hash the password using bcrypt
    await User.create({ firstName, lastName, companyName, email, password });
    console.log(`User registered: ${email}`);
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login attempt failed: User not found');
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      console.log(`User logged in: ${user.email}`);
      return res.redirect('/');
    } else {
      console.log('Login attempt failed: Password is incorrect');
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err.message, err.stack);
      return res.status(500).send('Error logging out');
    }
    console.log('User logged out successfully');
    res.redirect('/auth/login');
  });
});

router.get('/auth/change-password', isAuthenticated, (req, res) => {
  res.render('change-password');
});

router.post('/auth/change-password', isAuthenticated, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).send('Old password is incorrect');
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    console.log(`Password changed for user: ${user.email}`);
    res.send('Password successfully changed');
  } catch (error) {
    console.error('Error changing password:', error.message, error.stack);
    res.status(500).send('Error changing password');
  }
});

export default router;