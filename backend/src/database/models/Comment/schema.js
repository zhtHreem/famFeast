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
  recipeId: { // Add this line
    type: mongoose.Schema.Types.ObjectId, // Assuming recipe IDs are also ObjectId
    required: true, // You can set this to true to ensure every comment must belong to a recipe
    ref: 'Recipe', // Reference to the Recipe model (adjust based on your actual model name)
  },
});

// Create and export models
const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
