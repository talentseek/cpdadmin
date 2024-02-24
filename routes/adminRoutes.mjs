import express from 'express';
import User from '../models/User.mjs';
import bcrypt from 'bcrypt';
import { isAuthenticated } from './middleware/authMiddleware.mjs';
const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user && user.isAdmin) {
      console.log(`Admin access granted for user: ${user.email}`);
      next();
    } else {
      console.log('Unauthorized access attempt by non-admin user.');
      res.status(401).send('Unauthorized: Only admin can access this');
    }
  } catch (err) {
    console.error(`Error fetching user for admin check: ${err.message}`, err.stack);
    res.status(500).send('Internal server error');
  }
};

// Route to render admin panel interface
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    console.log('Admin panel loaded successfully.');
    res.render('admin', { users });
  } catch (err) {
    console.error(`Error fetching users for admin panel: ${err.message}`, err.stack);
    res.status(500).send('Failed to load admin panel');
  }
});

router.get('/admin/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    console.log('Users fetched successfully for admin panel.');
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

router.post('/admin/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, companyName, email, password, campaignIds } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let campaignIdsArray = [];
    if (typeof campaignIds === 'string') {
      campaignIdsArray = campaignIds.split(',').map(id => {
        const trimmedId = id.trim();
        return parseInt(trimmedId, 10);
      }).filter(id => !isNaN(id) && isFinite(id));
    }
    const newUser = await User.create({ firstName, lastName, companyName, email, password: hashedPassword, campaignIds: campaignIdsArray });
    console.log('New user created:', newUser.email);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

export default router;