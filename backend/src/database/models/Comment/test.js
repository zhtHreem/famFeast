const mongoose = require('mongoose');
const connectDB = require('../../connectivity'); 
const Comment = require('./schema'); 

const runTest = async () => {
  try {
   
    await connectDB();
    console.log('MongoDB connected...');

    // Create a new comment
    const commentData = {
      recipe: '60c72b2f8a4c3b001f6477d0', 
      user: '60c72b2f8a4c3b001f6477d1', 
      content: 'This is a test comment',
    };

    let newComment = new Comment(commentData);
    await newComment.save();
    console.log('Comment created:', newComment);

    // Read all comments for a specific recipe
    const comments = await Comment.find({ recipe: commentData.recipe });
    console.log('All comments for the recipe:', comments);

    // Add a reply to the created comment
    const replyData = {
      recipe: commentData.recipe,
      user: commentData.user,
      content: 'This is a test reply',
      replies: [], // No nested replies yet
    };

    newComment.replies.push(replyData);
    await newComment.save();
    console.log('Reply added:', newComment);

    // Read replies for the created comment
    const updatedComment = await Comment.findById(newComment._id);
    console.log('Replies for the comment:', updatedComment.replies);

    // Update the created comment
    newComment.content = 'This is an updated test comment';
    await newComment.save();
    console.log('Updated comment:', newComment);

    // Delete the created comment
    await Comment.findByIdAndDelete(newComment._id);
    console.log('Comment deleted');

    // Ensure the comment is deleted by checking the list again
    const commentsAfterDelete = await Comment.find({ recipe: commentData.recipe });
    console.log('Comments after deletion:', commentsAfterDelete);

    // Close the database connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error in test:', error);
  }
};

runTest();
