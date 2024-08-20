import mongoose from 'mongoose';

// Define the reply schema
const replySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the comment schema
const commentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  replies: [replySchema], // Use replySchema directly here
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export models
const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
