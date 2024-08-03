const express = require('express');
const router = express.Router();
const Comment = require('./schema'); 

// Create a new comment
router.post('/', async (req, res) => {
  try {
    const newComment = new Comment({
      recipe: req.body.recipe,
      user: req.body.user,
      content: req.body.content,
      parent: req.body.parent || null, // If parent is provided, set it; otherwise, null
    });
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: `Error creating comment: ${error.message}` });
  }
});

// Read all comments for a specific recipe
router.get('/:recipeId', async (req, res) => {
  try {
    // Fetch top-level comments (where parent is null)
    const comments = await Comment.find({ recipe: req.params.recipeId, parent: null })
      .populate('user', 'name')
      .populate({
        path: 'replies', // Populate nested replies if needed
        populate: {
          path: 'user',
          select: 'name',
        },
      });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: `Error fetching comments: ${error.message}` });
  }
});

// Fetch replies for a specific comment
router.get('/:commentId/replies', async (req, res) => {
  try {
    // Fetch replies for a specific comment
    const replies = await Comment.find({ parent: req.params.commentId })
      .populate('user', 'name');
    res.status(200).json(replies);
  } catch (error) {
    res.status(500).json({ error: `Error fetching replies: ${error.message}` });
  }
});

// Update a comment by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: `Error updating comment: ${error.message}` });
  }
});

// Delete a comment by ID
router.delete('/:id', async (req, res) => {
  try {
    // Find and delete the comment
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Also delete replies to this comment
    await Comment.deleteMany({ parent: req.params.id });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: `Error deleting comment: ${error.message}` });
  }
});

module.exports = router;
