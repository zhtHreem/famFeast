const mongoose = require('mongoose');
const connectDB = require('../../connectivity'); // Adjust the path if necessary
const User = require('./user'); // Adjust the path if necessary

const runTest = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('MongoDB connected...');

    // Create a new user
    const userData = {
      username: 'Jown Doe',
      email: 'john1.doe@example.com',
      password: 'password123',
    };

    // Insert the first user
    let newUser = new User(userData);
    await newUser.save();
    console.log('User created:', newUser);

    // Read all users
    const users = await User.find();
    console.log('All users:', users);

    // Update user by ID
    const userId = newUser._id; // Use the ID of the newly created user
    const updatedUserData = { username: 'Jane Doe' };
    newUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });
    console.log('Updated user:', newUser);

    // Read user by ID
    const userById = await User.findById(userId);
    console.log('User by ID:', userById);

    // Attempt to insert the same user again (should cause a duplicate key error)
    try {
      newUser = new User(userData);
      await newUser.save();
    } catch (error) {
      if (error.code === 11000) { // MongoDB duplicate key error code
        console.log('Duplicate key error:', error.message);
      } else {
        console.error('Error inserting duplicate user:', error);
      }
    }

    // Delete user by ID
    await User.findByIdAndDelete(userId);
    console.log('User deleted by ID:', userId);

    // Verify deletion
    const deletedUser = await User.findById(userId);
    console.log('Deleted user verification:', deletedUser); // Should be null

    // Close the database connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error in test:', error);
  }
};

runTest();
