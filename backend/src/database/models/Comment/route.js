import express from 'express';
import Comment from './schema.js';
const router = express.Router();


// Get all comments
// Get comments for a specific recipe
router.get('/comments', async (req, res) => {
  const { recipeId } = req.query; // Get recipeId from query params
  try {
    const comments = await Comment.find({ recipeId }); // Fetch comments for the specific recipe
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});



// Post a new comment
router.post('/comments', async (req, res) => {
  const { name, text, recipeId } = req.body; // Include recipeId in the request body
  try {
    const newComment = new Comment({ name, text, replies: [], recipeId }); // Add recipeId
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(400).json({ error: 'Failed to add comment', details: err.message });
  }
});


// Post a reply to a comment
router.post('/comments/:id/replies', async (req, res) => {
  console.log("Request Body:", req.body);
  // In your backend
console.log("Reply Data:", req.body); // Check what data is coming in
console.log("Comment ID:",req.params); // Log the comment ID

  const { id } = req.params;
  const { name, text } = req.body;
  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Add the new reply to the comment's replies array
    const newReply = { name, text };
    console.log("before saving reply", newReply);
    comment.replies.push(newReply);
    await comment.save();
    console.log("after saving reply", comment); 
    res.status(201).json(comment);
  } catch (err) {
    console.error('Failed to add reply:', err);
    res.status(400).json({ error: 'Failed to add reply', details: err.message });
  }
});

export default router;
