import express from 'express';
const router = express.Router();

import Comment from './schema.js'; // Ensure this imports the updated schema

// Get all comments
router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Post a new comment
router.post('/comments', async (req, res) => {
  const { name, text } = req.body;
  console.log("Request Body:", req.body);
  try {
    const newComment = new Comment({ name, text, replies: [] });
    console.log("before saving", newComment);
    await newComment.save();
    console.log("after",newComment);
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(400).json({ error: 'Failed to add comment', details: err.message });
  }
});

// Post a reply to a comment
router.post('/comments/:id/replies', async (req, res) => {
  console.log("Request Body:", req.body);
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
