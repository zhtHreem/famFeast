import express from 'express';
import User from './user.js';
import mongoose from 'mongoose';
const router = express.Router();

// Create New User
router.post('/users', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({
        username,
        email,
        password,
        followers: [], // Initialize as an empty array
        following: [], 
    });
        
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




// Read searched Users
router.get('/users/:id', async (req, res) => {
    console.log(`Reading user with ID: ${req.params.id}`);
    try {
        const users = await User.findById(req.params.id);
        console.log(users)
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: `Error fetching users: ${error.message}` });
    }
});

// Follow a user

router.post('/follow/:id', async (req, res) => {
    const { loggedInUser } = req.body; // ID of the logged-in user (you)
   console.log("logged in",loggedInUser)
      console.log("search user",req.params.id)

    try {
        // Add logged-in user to the followers array of the searched user
        const userToFollow = await User.findByIdAndUpdate(
           req.params.id , // Searched user (user being followed)
            { $addToSet: { followers: loggedInUser } }, // Add the logged-in user to the followers array
            { new: true }
        );

        // Add searched user to the following array of the logged-in user
        await User.findByIdAndUpdate(
            loggedInUser , // Logged-in user (you)
            { $addToSet: { following:req.params.id} }, // Add searched user to the following array
            { new: true }
        );

        res.status(200).json(userToFollow);
    } catch (error) {
        res.status(500).json({ error: `Error following user: ${error.message}` });
    }
});


// Unfollow a user
router.post('/unfollow/:id', async (req, res) => {
    const { loggedInUser} = req.body; // ID of the logged-in user (you)

    try {
        // Remove logged-in user from the followers array of the searched user
        const userToUnfollow = await User.findByIdAndUpdate(
            req.params.id , 
            { $pull: { followers:  loggedInUser  } }, // Remove the logged-in user from the followers array
            { new: true }
        );

        // Remove searched user from the following array of the logged-in user
        await User.findByIdAndUpdate(
             loggedInUser, // Logged-in user (you)
            { $pull: { following: req.params.id} }, // Remove searched user from the following array
            { new: true }
        );

        res.status(200).json(userToUnfollow);
    } catch (error) {
        res.status(500).json({ error: `Error unfollowing user: ${error.message}` });
    }
});


// Get followers of a user
router.get('/users/:id/follower', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("userid",userId)
    // Find the user by ID and populate the followers
    const user = await User.findById(userId).populate('followers', 'username email');
        console.log("user :::::",user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the followers' details
    res.json({ followers: user.followers });
        console.log("followersL", user.followers)

  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get following of a user
router.get('/users/:id/following', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("userid",userId)
    // Find the user by ID and populate the followers
    const user = await User.findById(userId).populate('following', 'username email');
        console.log("user :::::",user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the followers' details
    res.json({ following: user.following });
        console.log("followersL", user.following)

  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error' });
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
