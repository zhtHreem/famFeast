import fetch from 'node-fetch'; 
import connectDB from '../../connectivity.js'
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
const runTest = async () => {
    try {
      
      await connectDB();
      console.log('MongoDB connected...');
      
     
      const baseURL = 'http://localhost:5000/api'; 
  
      // Create a new user
      let response = await fetch(`${baseURL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Jawn Doe', email: 'jawn.doe@example.com', password: 'password123' }),
      });
      let responseText = await response.text();
      console.log('Response text:', responseText); 
      let user = JSON.parse(responseText);
      console.log('User created:', user);
  
      // Read all users
      response = await fetch(`${baseURL}/users`);
      responseText = await response.text();
      console.log('Response text:', responseText); 
      let users = JSON.parse(responseText);
      console.log('All users:', users);
  
      // Update user by ID
        
      // Ensure userId is defined and correctly formatted
      // Ensure userId is defined and correctly formatted
     // if (!userId) {
      //  throw new Error('User ID is undefined');
     // }
  
     
     // const userId ='66b0013bacbfa7921aa971ca' //user._id ? user._id.toString() : null; // Convert ObjectId to string
     const userId = '66ae8b0b2d9edbb991ff70ae'; // Create a new ObjectId
      try {
        let response = await fetch(`${baseURL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Jane Doe' }),
        });
    
        let responseText = await response.text();
        console.log('Response text:', responseText); 
    
        if (response.ok) {
            let user = JSON.parse(responseText);
            console.log('Updated user:', user);
        } else {
            console.error('Failed to update user:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  
      // Read user by ID
      response = await fetch(`${baseURL}/users/${userId}`);
      responseText = await response.text();
      console.log('Response text read:', responseText); // Log response text
      const userById = JSON.parse(responseText);
      console.log('User by ID:', userById);
  
      // Attempt to insert the same user again (should cause a duplicate key error)
      try {
        response = await fetch(`${baseURL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'John Doe', email: 'john.doe@example.com', password: 'password123' }),
        });
        responseText = await response.text();
        console.log('Response text:', responseText); 
        const duplicateUser = JSON.parse(responseText);
        console.log('Duplicate user:', duplicateUser);
      } catch (error) {
        console.error('Duplicate key error:', error.message);
      }
  
      // Delete user by ID
      response = await fetch(`${baseURL}/users/${userId}`, { method: 'DELETE' });
      responseText = await response.text();
      console.log('Response text:', responseText); 
      console.log('User deleted:', responseText);
  
      // Verify deletion
      response = await fetch(`${baseURL}/users/${userId}`);
      responseText = await response.text();
      console.log('Response text:', responseText); 
      const deletedUser = JSON.parse(responseText);
      console.log('Deleted user verification:', deletedUser); // Should return a 404 error message
  
      
      await mongoose.connection.close();
    } catch (error) {
      console.error('Error in test:', error);
    }
  };
  
  runTest();
  