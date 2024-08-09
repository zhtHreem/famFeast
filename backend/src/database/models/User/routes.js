import express from 'express';
import User from './user.js';
const router = express.Router();

// Create New User
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        console.log("user1",req.body);
        console.log("user",user);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error); 
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            if (field === 'email') {
                return res.status(400).json({ error: 'Email Address is already in use.' });
            }
            if (field === 'username') {
                return res.status(400).json({ error: 'Username is already taken.' });
            }
        }
        res.status(500).json({ error: `Error creating user: ${error.message}` });
    }
});


// Route for user login
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('email:', email,'password:',password);
    try {
      // Find user by email
      const user = await User.findOne({ email });
      console.log('users:', user);
      if (!user) {
        return res.status(400).json({ error: 'Invalid email ' });
      }
  
      // Check password
      const isMatch = await user.comparePassword(password);
      console.log('password111:', isMatch);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid  password' });
      }
  
      
      const token = user;
      console.log("token:",user._id,user.username)
      const objectId = user._id;
      const idString = objectId.toString();
      console.log(idString);
      // Send response
      res.status(200).json({ user: { id:idString,email: user.email, name: user.username } });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

// Read All Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: `Error fetching users: ${error.message}` });
    }
});

// Read All Users
router.get('/users/:id', async (req, res) => {
    console.log(`Reading user with ID: ${req.params.id}`);
    try {
        const users = await User.findById(req.params.id);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: `Error fetching users: ${error.message}` });
    }
});

// Update User by ID

router.put('/users/:id', async (req, res) => {
    console.log(`Updating user with ID: ${req.params.id}`);
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            if (field === 'email') {
                return res.status(400).json({ error: 'Email address is already in use.' });
            }
            if (field === 'username') {
                return res.status(400).json({ error: 'Username is already taken.' });
            }
        }
        res.status(500).json({ error: `Error updating user: ${error.message}` });
    }
});

// Delete User by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: `Error deleting user: ${error.message}` });
    }
});

export default router;
